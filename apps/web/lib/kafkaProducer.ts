import { producer } from './kafkaConfig';

async function initializeProducer() {
  await producer.connect();
}

export { initializeProducer, producer };
