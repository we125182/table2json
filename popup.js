// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

"use strict";

let body = document.body;

const defaultConfig = {
  selector: 'table',
  label: '说明',
  prop: '参数名'
}
let config = {};

let host = ''

window.onload = function () {
  const form = document.getElementById("form");
  chrome.tabs.getSelected(null, function (tab) {
    host = new URL(tab.url).host
    chrome.storage.sync.get([host], function(result) {
      config = Object.assign({}, defaultConfig, result[host])
      console.log(config)
      form.innerHTML = renderTemplate(config);
    });
  });
  document.getElementById("submit").addEventListener("click", saveChange);
};

function renderTemplate(config) {
  return Object.keys(config).reduce((pre, key) => {
    return (
      pre +
      `
    <div class="form-item">
      <label class="form-item__label">${key}</label>
      <input class="form-item__input" id="${key}" value="${config[key]}">
    </div>
    `
    );
  }, "");
}

function saveChange(e) {
  e.preventDefault();
  let prop = ''
  Array.from(document.getElementsByClassName("form-item__input")).forEach(
    (el) => {
      config[el.id] = el.value
      if (el.id === 'prop') {
        prop = el.value
      }
    }
  );
  if (!prop) {
    document.getElementById('error-tip').innerHTML = 'prop不能为空'
    return
  } else {
    document.getElementById('error-tip').innerHTML = ''
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        let data = {}
        data[host] = config
        chrome.storage.sync.set(data)
        chrome.tabs.sendMessage(tabs[0].id, { ...config });
        setTimeout(window.close, 10)
      }
    );
  }
}
