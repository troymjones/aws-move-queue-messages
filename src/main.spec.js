/**
 * @jest-environment node
 */

const { handle } = require('./main');

describe('handle', () => {
  const sourceQueueUrl = 'https://sqs.region.amazonaws.com/123456789/srcQueue';
  const targetQueueUrl = 'https://sqs.region.amazonaws.com/123456789/targetQueue';
  const maxMessages = 5;
  let getCountVal = 3;

  test('to move messages', async () => {
    const sqs = {
      getCount: jest.fn(() => getCountVal),
      moveMessage: jest.fn(),
    };

    const prompt = jest.fn(() => ({ move: true }));
    const copy = false;

    await handle({
      sourceQueueUrl,
      targetQueueUrl,
      maxMessages,
      copy,
      sqs,
      prompt,
    });

    expect(sqs.getCount).toHaveBeenCalled();
    expect(sqs.moveMessage).toHaveBeenCalledTimes(getCountVal);
  });

  test('to move messages with maxCount', async () => {
    const sqs = {
      getCount: jest.fn(() => getCountVal),
      moveMessage: jest.fn(),
    };

    const prompt = jest.fn(() => ({ move: true }));
    const copy = false;

    await handle({
      sourceQueueUrl,
      targetQueueUrl,
      copy,
      sqs,
      prompt,
    });

    expect(sqs.getCount).toHaveBeenCalled();
    expect(sqs.moveMessage).toHaveBeenCalledWith(sourceQueueUrl, targetQueueUrl, copy);
  });

  test('to copy messages', async () => {
    getCountVal = 10;
    const sqs = {
      getCount: jest.fn(() => getCountVal),
      moveMessage: jest.fn(),
    };

    const prompt = jest.fn(() => ({ move: true }));
    const copy = true;

    await handle({
      sourceQueueUrl,
      targetQueueUrl,
      maxMessages,
      copy,
      sqs,
      prompt,
    });

    expect(sqs.getCount).toHaveBeenCalled();
    expect(sqs.moveMessage).toHaveBeenCalledWith(sourceQueueUrl, targetQueueUrl, copy);
    expect(sqs.moveMessage).toHaveBeenCalledTimes(maxMessages);
  });

  test('to move messages without prompt', async () => {
    const sqs = {
      getCount: jest.fn(() => getCountVal),
      moveMessage: jest.fn(),
    };

    const prompt = jest.fn();
    const copy = false;

    await handle({
      sourceQueueUrl,
      targetQueueUrl,
      maxMessages,
      copy,
      sqs,
      prompt,
      skipPrompt: true,
    });

    expect(sqs.getCount).toHaveBeenCalled();
    expect(sqs.moveMessage).toHaveBeenCalledWith(sourceQueueUrl, targetQueueUrl, copy);
  });

  describe('reject promise', () => {
    test('on failed count', () => {
      const sqs = {
        getCount: jest.fn().mockRejectedValue({ message: 'getCount' }),
        moveMessage: jest.fn(),
      };

      const prompt = jest.fn(() => ({ move: true }));
      const copy = false;

      expect(handle({
        sourceQueueUrl,
        targetQueueUrl,
        maxMessages,
        copy,
        sqs,
        prompt,
      })).rejects.toEqual({ message: 'getCount' });
    });

    test('on failed move message', () => {
      const sqs = {
        getCount: jest.fn(() => 1),
        moveMessage: jest.fn().mockRejectedValue({ message: 'moveMessage' }),
      };

      const prompt = jest.fn(() => ({ move: true }));
      const copy = false;

      expect(handle({
        sourceQueueUrl,
        targetQueueUrl,
        maxMessages,
        copy,
        sqs,
        prompt,
      })).rejects.toEqual(new Error('moveMessage'));
    });

    test('on queue empty', () => {
      const sqs = {
        getCount: jest.fn(() => 0),
        moveMessage: jest.fn(),
      };

      const prompt = jest.fn(() => ({ move: true }));
      const copy = false;

      expect(handle({
        sourceQueueUrl,
        targetQueueUrl,
        maxMessages,
        copy,
        sqs,
        prompt,
      })).rejects.toEqual(new Error('The queue https://sqs.region.amazonaws.com/123456789/srcQueue is empty!'));
    });
  });
});
