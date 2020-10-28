// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({'showdoc.ylzpay.com': {
    selector: 'table',
    label: '说明',
    prop: '参数名'
  }})
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostEquals: 'showdoc.ylzpay.com' },
        })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let key in changes) {
      var storageChange = changes[key];
      console.log('存储键“%s”（位于“%s”命名空间中）已更改。' +
                      '原来的值为“%s”，新的值为“%s”。',
                  key,
                  namespace,
                  storageChange.oldValue,
                  storageChange.newValue);
    }
  });
});
