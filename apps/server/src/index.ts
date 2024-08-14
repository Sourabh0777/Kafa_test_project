import 'dotenv/config';
import express from 'express';
import { Kafka } from 'kafkajs';

const app = express();

// Kafka client configuration
const kafka = new Kafka({
  clientId: 'kakfaQueue',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'user-registrations' });

// Function to initialize and run the consumer
async function runConsumer() {
  await consumer.connect();
  await consumer.subscribe({
    topic: 'user',
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message || !message?.value) {
        return;
      }

      const parsedMessage = JSON.parse(message?.value.toString());
      console.log('🚀 ~ eachMessage: ~ parsedMessage:', parsedMessage);
      switch (parsedMessage.status) {
        case 'login':
          console.log('login', parsedMessage);
          break;
        case 'registered':
          console.log('registered', parsedMessage);
          break;
      }

      // Example: handle message, e.g., save to a database, etc.
    },
  });
}

// Initialize Kafka consumer
runConsumer().catch(console.error);
