/**
 * @jest-environment node
 */

const { createClient } = require('./sqs');

const mockCallbackFunction = (error, data) => (
  (options, callback) => {
    callback(error, data);
  }
);

const sourceQueueUrl = 'https://sqs.region.amazonaws.com/123456789/srcQueue';
const targetQueueUrl = 'https://sqs.region.amazonaws.com/123456789/targetQueue';

describe('getCount', () => {
  test('to resolve promise', async () => {
    const sqs = createClient({
      getQueueAttributes: mockCallbackFunction(
        null,
        { Attributes: { ApproximateNumberOfMessages: 3 } },
      ),
    });

    const count = await sqs.getCount(sourceQueueUrl);
    expect(count).toEqual(3);
  });

  test('to reject promise', () => {
    const sqs = createClient({
      getQueueAttributes: mockCallbackFunction({ message: 'error' }, null),
    });

    expect(sqs.getCount(sourceQueueUrl)).rejects.toEqual({ message: 'error' });
  });

  test('to pass queue url', async () => {
    const mockSqs = {
      getQueueAttributes: mockCallbackFunction(
        null,
        { Attributes: { ApproximateNumberOfMessages: 3 } },
      ),
    };
    jest.spyOn(mockSqs, 'getQueueAttributes');

    const sqs = createClient(mockSqs);

    await sqs.getCount(sourceQueueUrl);
    expect(mockSqs.getQueueAttributes).toHaveBeenCalledWith(
      {
        QueueUrl: sourceQueueUrl,
        AttributeNames: [
          'ApproximateNumberOfMessages',
        ],
      },
      expect.any(Function),
    );
  });
});

describe('moveMessage', () => {
  test('to resolve promise', async () => {
    const sqs = createClient({
      receiveMessage: mockCallbackFunction(null, {
        Messages: [
          {
            Body: 'Body',
            ReceiptHandle: 'ReceiptHandle',
            MessageAttributes: 'MessageAttributes',
          },
        ],
      }),
      sendMessage: mockCallbackFunction(null, {}),
      deleteMessage: mockCallbackFunction(null, {}),
    });

    const handle = await sqs.moveMessage(sourceQueueUrl, targetQueueUrl, false);
    expect(handle).toEqual('ReceiptHandle');
  });

  test('to resolve promise - copy', async () => {
    const sqs = createClient({
      receiveMessage: mockCallbackFunction(null, {
        Messages: [
          {
            Body: 'Body',
            ReceiptHandle: 'ReceiptHandle',
          },
        ],
      }),
      sendMessage: mockCallbackFunction(null, {}),
    });

    const handle = await sqs.moveMessage(sourceQueueUrl, targetQueueUrl, true);
    expect(handle).toEqual('ReceiptHandle');
  });

  test('to reject promise', () => {
    const sqs = createClient({
      receiveMessage: mockCallbackFunction({ message: 'error' }, null),
      sendMessage: mockCallbackFunction(null, {}),
      deleteMessage: mockCallbackFunction(null, {}),
    });

    expect(sqs.moveMessage(sourceQueueUrl, targetQueueUrl, false)).rejects.toEqual({ message: 'error' });
  });

  test('to call receiveMessage with expected parameters', async () => {
    const mockSqs = {
      receiveMessage: mockCallbackFunction(null, {
        Messages: [
          {
            Body: 'Body',
            ReceiptHandle: 'ReceiptHandle',
          },
        ],
      }),
      sendMessage: mockCallbackFunction(null, {}),
      deleteMessage: mockCallbackFunction(null, {}),
    };
    jest.spyOn(mockSqs, 'receiveMessage');

    const sqs = createClient(mockSqs);

    await sqs.moveMessage(sourceQueueUrl, targetQueueUrl, false);
    expect(mockSqs.receiveMessage).toHaveBeenCalledWith(
      {
        QueueUrl: sourceQueueUrl,
        MessageAttributeNames: ['All'],
      },
      expect.any(Function),
    );
  });

  test('to call sendMessage with expected parameters', async () => {
    const messageAttributes = 'MessageAttributes';
    const mockSqs = {
      receiveMessage: mockCallbackFunction(null, {
        Messages: [
          {
            Body: 'Body',
            ReceiptHandle: 'ReceiptHandle',
            MessageAttributes: messageAttributes,
          },
        ],
      }),
      sendMessage: mockCallbackFunction(null, {}),
      deleteMessage: mockCallbackFunction(null, {}),
    };
    jest.spyOn(mockSqs, 'sendMessage');

    const sqs = createClient(mockSqs);

    await sqs.moveMessage(sourceQueueUrl, targetQueueUrl, false);
    expect(mockSqs.sendMessage).toHaveBeenCalledWith(
      {
        MessageBody: 'Body',
        QueueUrl: targetQueueUrl,
        MessageAttributes: messageAttributes,
      },
      expect.any(Function),
    );
  });

  test('to call sendMessage with MessageAttributes', async () => {
    const messageAttributes = {
      messageType: {
        Type: 'String',
        StringValue: 'messageType1',
      },
    };
    const mockSqs = {
      receiveMessage: mockCallbackFunction(null, {
        Messages: [
          {
            Body: 'Body',
            ReceiptHandle: 'ReceiptHandle',
            MessageAttributes: messageAttributes,
          },
        ],
      }),
      sendMessage: mockCallbackFunction(null, {}),
      deleteMessage: mockCallbackFunction(null, {}),
    };
    jest.spyOn(mockSqs, 'sendMessage');

    const sqs = createClient(mockSqs);

    await sqs.moveMessage(sourceQueueUrl, targetQueueUrl);
    expect(mockSqs.sendMessage).toHaveBeenCalledWith(
      {
        MessageBody: 'Body',
        QueueUrl: targetQueueUrl,
        MessageAttributes: messageAttributes,
      },
      expect.any(Function),
    );
  });

  test('to call sendMessage with MessageAttributes adjusted', async () => {
    const expectedMessageAttributes = {
      messageType: {
        Type: 'String',
        StringValue: 'messageType1',
      },
    };

    const messageAttributes = {
      messageType: {
        Type: 'String',
        StringValue: 'messageType1',
      },
    };

    const mockSqs = {
      receiveMessage: mockCallbackFunction(null, {
        Messages: [
          {
            Body: 'Body',
            ReceiptHandle: 'ReceiptHandle',
            MessageAttributes: messageAttributes,
          },
        ],
      }),
      sendMessage: mockCallbackFunction(null, {}),
      deleteMessage: mockCallbackFunction(null, {}),
    };
    jest.spyOn(mockSqs, 'sendMessage');

    const sqs = createClient(mockSqs);

    await sqs.moveMessage(sourceQueueUrl, targetQueueUrl);
    expect(mockSqs.sendMessage).toHaveBeenCalledWith(
      {
        MessageBody: 'Body',
        QueueUrl: targetQueueUrl,
        MessageAttributes: expectedMessageAttributes,
      },
      expect.any(Function),
    );
  });

  test('to call deleteMessage with expected parameters', async () => {
    const mockSqs = {
      receiveMessage: mockCallbackFunction(null, {
        Messages: [
          {
            Body: 'Body',
            ReceiptHandle: 'ReceiptHandle',
          },
        ],
      }),
      sendMessage: mockCallbackFunction(null, {}),
      deleteMessage: mockCallbackFunction(null, {}),
    };
    jest.spyOn(mockSqs, 'deleteMessage');

    const sqs = createClient(mockSqs);

    await sqs.moveMessage(sourceQueueUrl, targetQueueUrl, false);
    expect(mockSqs.deleteMessage).toHaveBeenCalledWith(
      {
        ReceiptHandle: 'ReceiptHandle',
        QueueUrl: sourceQueueUrl,
      },
      expect.any(Function),
    );
  });
});
