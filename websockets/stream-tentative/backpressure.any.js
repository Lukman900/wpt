// META: script=../websocket.sub.js
// META: script=resources/url-constants.js
// META: global=window,worker
// META: timeout=long

// Allow for this much timer jitter.
const JITTER_ALLOWANCE_MS = 200;

// The amount of buffering a WebSocket connection has is not standardised, but
// it's reasonable to expect that it will not be as large as 8MB.
const MESSAGE_SIZE = 8 * 1024 * 1024;


// This test works by using a server WebSocket handler which sends an 8MB
// message, and then sends a second message with the time it measured the first
// message taking. On the browser side, we wait 2 seconds before reading from
// the socket. This should ensure it takes at least 2 seconds to finish sending
// the 8MB message.
promise_test(async t => {
  const wss = new WebSocketStream(`${BASEURL}/send-backpressure`);
  const { readable } = await wss.connection;
  const reader = readable.getReader();

  // Create backpressure for 2 seconds.
  await new Promise(resolve => t.step_timeout(resolve, 2000));

  // Skip the 8MB message.
  await reader.read();

  // Read the time it took.
  const { value, done } = await reader.read();

  // A browser can pass this test simply by being slow. This may be a source of
  // flakiness for browsers that do not implement backpressure properly.
  assert_greater_than_equal(Number(value), 2,
                            'data send should have taken at least 2 seconds');
}, 'backpressure should be applied to received messages');

// In this test, the server WebSocket handler waits 2 seconds, and the browser
// times how long it takes to send the first message.
promise_test(async t => {
  const wss = new WebSocketStream(`${BASEURL}/receive-backpressure`);
  const { writable } = await wss.connection;
  const writer = writable.getWriter();
  const start = performance.now();
  await writer.write(new Uint8Array(MESSAGE_SIZE));
  const elapsed = performance.now() - start;
  assert_greater_than_equal(elapsed, 2000 - JITTER_ALLOWANCE_MS);
}, 'backpressure should be applied to sent messages');
