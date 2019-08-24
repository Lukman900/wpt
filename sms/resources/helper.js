'use strict';

// These tests rely on the User Agent providing an implementation of
// the sms retriever.
//
// In Chromium-based browsers this implementation is provided by a polyfill
// in order to reduce the amount of test-only code shipped to users. To enable
// these tests the browser must be run with these options:
//
//   --enable-blink-features=MojoJS,MojoJSTest

const loadChromiumResources = async () => {
  if (!window.MojoInterfaceInterceptor) {
    // Do nothing on non-Chromium-based browsers or when the Mojo bindings are
    // not present in the global namespace.
    return;
  }

  const resources = [
    '/gen/layout_test_data/mojo/public/js/mojo_bindings.js',
    '/gen/mojo/public/mojom/base/big_buffer.mojom.js',
    '/gen/mojo/public/mojom/base/string16.mojom.js',
    '/gen/mojo/public/mojom/base/time.mojom.js',
    '/gen/third_party/blink/public/mojom/sms/sms_receiver.mojom.js',
    '/resources/chromium/sms_mock.js',
  ];

  await Promise.all(resources.map(path => {
    const script = document.createElement('script');
    script.src = path;
    script.async = false;
    const promise = new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
    });
    document.head.appendChild(script);
    return promise;
  }));

  Status.kSuccess = blink.mojom.SmsStatus.kSuccess;
  Status.kTimeout = blink.mojom.SmsStatus.kTimeout;
  Status.kCancelled = blink.mojom.SmsStatus.kCancelled;
};

const Status = {};

async function initialize_sms_tests() {
  if (typeof SmsTest === 'undefined') {
    await loadChromiumResources();
  }
  if (typeof SmsTest == 'undefined') {
    throw new Error('Mojo testing interface is not available.');
  }
  return new SmsTest();
}

function sms_receiver_test(func, description) {
  promise_test(async test => {
    const smsTest = await initialize_sms_tests();
    return func(test, values => smsTest.setReturnValues(values));
  }, description);
}
