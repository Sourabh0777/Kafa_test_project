import { Kafka } from "kafkajs";

// Kafka client configuration
const kafka = new Kafka({
  clientId: "kakfaQueue", // Replace with your client ID
  brokers: ['localhost:9092'], // Replace with your Kafka brokers
});

const consumer = kafka.consumer({ groupId: "user-registrations" }); // Replace with your consumer group ID

// Function to initialize and run the consumer
async function runConsumer() {
  await consumer.connect();
  await consumer.subscribe({
    topic: "user",
    fromBeginning: true,
  }); // Replace with your Kafka topic

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message || !message?.value) {
        return;
      }
      // Log the message
      console.log(`Received message: ${message?.value.toString()}`);

      // Optionally, you can parse and handle the message here
      const parsedMessage = JSON.parse(message?.value.toString());
      console.log(`Parsed message:`, parsedMessage);

      // Example logging action
      // Log to a file, database, or other logging service
    },
  });
}
export { runConsumer };
