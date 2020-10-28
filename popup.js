// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

"use strict";

let body = document.body;

const domains = [
  {
    label: "selector",
    value: "table",
  },
  {
    label: "label",
    value: "说明",
  },
  {
    label: "prop",
    value: "参数名",
  },
];

window.onload = function () {
  const form = document.getElementById("form");
  form.innerHTML = renderTemplate(domains);
  document.getElementById("submit").addEventListener("click", saveChange);
};

function renderTemplate(domains) {
  return domains.reduce((pre, domain) => {
    return (
      pre +
      `
    <div class="form-item">
      <label class="form-item__label">${domain.label}</label>
      <input class="form-item__input" id="${domain.label}" value="${domain.value}">
    </div>
    `
    );
  }, "");
}

function saveChange(e) {
  Array.from(document.getElementsByClassName("form-item__input")).forEach(
    (el) => {
      const findIndex = domains.findIndex(
        (domain) => domain.label === el.getAttribute("id")
      );
      domains[findIndex].value = el.value;
    }
  );
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      const config = domains.reduce((pre, domain) => {
        pre[domain.label] = domain.value
        return pre
      }, {})
      chrome.tabs.sendMessage(tabs[0].id, { ...config }, (res) => {
        console.log("popup=>content");
        console.log(res);
        window.close()
      });
    }
  );
  e.preventDefault();
}
