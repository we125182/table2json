// @ts-nocheck
// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

"use strict";

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({
    "showdoc.ylzpay.com": {
      selector: "table",
      label: "说明",
      prop: "参数名"
    },
    "yapi.ylzpay.com": {
      selector: ".ant-table",
      label: "备注",
      prop: "参数名称"
    },
    "element.eleme.cn": {
      selector: "table",
      label: '说明',
      prop: '参数',
    }
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: "showdoc.ylzpay.com" },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: "yapi.ylzpay.com" },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: "element.eleme.cn" },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ]);
  });
});
