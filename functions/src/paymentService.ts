import Stripe from 'stripe';
import { Booking, BookingItem, GeneratedItinerary } from './types';
import * as admin from 'firebase-admin';

export class PaymentService {
  private stripe: Stripe;
  private db: FirebaseFirestore.Firestore;

  constructor(stripeSecretKey: string) {
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
    this.db = admin.firestore();
  }

  async createPaymentIntent(booking: Booking): Promise<string> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(booking.totalAmount * 100), // Convert to paisa
        currency: booking.currency.toLowerCase(),
        metadata: {
          bookingId: booking.id,
          userId: booking.userId,
          itineraryId: booking.itineraryId
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Store payment intent ID in booking
      await this.db.collection('bookings').doc(booking.id).update({
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: 'pending'
      });

      return paymentIntent.client_secret!;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
    try {
      // Get payment intent details
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (!paymentIntent.metadata.bookingId) {
        throw new Error('Booking ID not found in payment intent metadata');
      }

      const bookingId = paymentIntent.metadata.bookingId;
      
      // Update booking status
      await this.db.collection('bookings').doc(bookingId).update({
        paymentStatus: 'completed',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Get booking details
      const bookingDoc = await this.db.collection('bookings').doc(bookingId).get();
      const booking = bookingDoc.data() as Booking;

      // Process individual bookings (hotels, flights, etc.)
      await this.processBookingConfirmations(booking);

    } catch (error) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  }

  async handlePaymentFailure(paymentIntentId: string): Promise<void> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (!paymentIntent.metadata.bookingId) {
        return;
      }

      const bookingId = paymentIntent.metadata.bookingId;
      
      await this.db.collection('bookings').doc(bookingId).update({
        paymentStatus: 'failed',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  }

  private async processBookingConfirmations(booking: Booking): Promise<void> {
    // This is where we would integrate with actual booking APIs
    // For now, we'll simulate the booking confirmations
    
    const confirmations = [];
    
    for (const item of booking.items) {
      try {
        let confirmationNumber;
        
        switch (item.type) {
          case 'accommodation':
            confirmationNumber = await this.bookAccommodation(item);
            break;
          case 'transport':
            confirmationNumber = await this.bookTransport(item);
            break;
          case 'activity':
            confirmationNumber = await this.bookActivity(item);
            break;
          default:
            continue;
        }

        confirmations.push({
          itemId: item.itemId,
          confirmationNumber,
          provider: this.getProviderForItem(item),
          status: 'confirmed',
          details: {
            bookingDate: new Date().toISOString(),
            itemName: item.name,
            quantity: item.quantity,
            totalPrice: item.totalPrice
          }
        });

      } catch (error) {
        console.error(`Error booking item ${item.itemId}:`, error);
        confirmations.push({
          itemId: item.itemId,
          confirmationNumber: '',
          provider: this.getProviderForItem(item),
          status: 'pending',
          details: { error: 'Booking failed, will retry' }
        });
      }
    }

    // Update booking with confirmations
    await this.db.collection('bookings').doc(booking.id).update({
      bookingConfirmations: confirmations,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  private async bookAccommodation(item: BookingItem): Promise<string> {
    // Simulate accommodation booking
    // In real implementation, this would call hotel booking APIs
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `HTL-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  private async bookTransport(item: BookingItem): Promise<string> {
    // Simulate transport booking
    // In real implementation, this would call airline/train booking APIs
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `TRN-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  private async bookActivity(item: BookingItem): Promise<string> {
    // Simulate activity booking
    // In real implementation, this would call activity booking APIs
    await new Promise(resolve => setTimeout(resolve, 500));
    return `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  private getProviderForItem(item: BookingItem): string {
    switch (item.type) {
      case 'accommodation':
        return 'BookingPartner';
      case 'transport':
        return 'TransportPartner';
      case 'activity':
        return 'ActivityPartner';
      default:
        return 'Unknown';
    }
  }

  async refundPayment(bookingId: string): Promise<boolean> {
    try {
      const bookingDoc = await this.db.collection('bookings').doc(bookingId).get();
      const booking = bookingDoc.data() as Booking;

      if (!booking.stripePaymentIntentId) {
        throw new Error('No payment intent found for this booking');
      }

      const refund = await this.stripe.refunds.create({
        payment_intent: booking.stripePaymentIntentId,
        reason: 'requested_by_customer'
      });

      if (refund.status === 'succeeded') {
        await this.db.collection('bookings').doc(bookingId).update({
          paymentStatus: 'refunded',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error processing refund:', error);
      return false;
    }
  }

  async createBookingFromItinerary(userId: string, itinerary: GeneratedItinerary): Promise<Booking> {
    const bookingItems: BookingItem[] = [];

    // Add accommodations
    for (const accommodation of itinerary.accommodations) {
      bookingItems.push({
        type: 'accommodation',
        itemId: accommodation.id,
        name: accommodation.name,
        quantity: 1,
        unitPrice: accommodation.pricePerNight * Math.ceil((itinerary.days.length)),
        totalPrice: accommodation.pricePerNight * Math.ceil((itinerary.days.length))
      });
    }

    // Add transport
    for (const transport of itinerary.transport) {
      bookingItems.push({
        type: 'transport',
        itemId: transport.id,
        name: `${transport.type} - ${transport.from.name} to ${transport.to.name}`,
        quantity: 1,
        unitPrice: transport.cost,
        totalPrice: transport.cost
      });
    }

    // Add activities
    for (const day of itinerary.days) {
      for (const activity of day.activities) {
        if (activity.cost > 0) {
          bookingItems.push({
            type: 'activity',
            itemId: activity.id,
            name: activity.name,
            quantity: 1,
            unitPrice: activity.cost,
            totalPrice: activity.cost
          });
        }
      }
    }

    const totalAmount = bookingItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const booking: Booking = {
      id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      itineraryId: itinerary.id,
      items: bookingItems,
      totalAmount,
      currency: itinerary.currency,
      paymentStatus: 'pending',
      paymentMethod: '',
      bookingConfirmations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save booking to Firestore
    await this.db.collection('bookings').doc(booking.id).set(booking);

    return booking;
  }
}