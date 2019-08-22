function checkImage(entry, expectedUrl, expectedID, expectedSize, timeLowerBound, options = []) {
  assert_equals(entry.name, '');
  assert_equals(entry.entryType, 'largest-contentful-paint');
  assert_equals(entry.duration, 0);
  assert_equals(entry.url, expectedUrl);
  assert_equals(entry.id, expectedID);
  assert_equals(entry.element, document.getElementById(expectedID));
  if (options.includes('renderTimeIs0')) {
    assert_equals(entry.renderTime, 0, 'renderTime should be 0');
    assert_between_exclusive(entry.loadTime, timeLowerBound, performance.now(),
      'loadTime should be between the lower bound and the current time');
    assert_equals(entry.startTime, entry.loadTime, 'startTime should equal loadTime');
  } else {
    assert_between_exclusive(entry.loadTime, timeLowerBound, entry.renderTime,
      'loadTime should occur between the lower bound and the renderTime');
    assert_greater_than_equal(performance.now(), entry.renderTime,
      'renderTime should occur before the entry is dispatched to the observer.');
    assert_equals(entry.startTime, entry.renderTime, 'startTime should equal renderTime');
  }
  if (options.includes('sizeLowerBound')) {
    assert_greater_than(entry.size, expectedSize);
  } else {
    assert_equals(entry.size, expectedSize);
  }
}