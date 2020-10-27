// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let body = document.body;

const domains = [
  {
    label: 'showdoc.ylzpay.com',
    selector: 'table'
  },
  {
    label: 'yapi.ylzpay.com',
    selector: '.ant-table'
  }
]

window.onload = function() {
  document.body.innerHTML = `
  <form>
  ${renderTemplate(domains)}
  <button class="button" type="submit" id="submit">保存</button>
  </form>
  `
  document.getElementById('submit').addEventListener('click', saveChange)
}

function renderTemplate(domains) {
  return domains.reduce((pre, domain) => {
    return pre + `
    <div class="form-item">
      <label class="form-item__label">${domain.label}</label>
      <input class="form-item__input" id="${domain.label}" value="${domain.selector}">
    </div>
    `
  }, '')
}

function saveChange(e) {
  Array.from(document.getElementsByClassName('form-item__input')).forEach(el => {
    const findIndex = domains.findIndex(domain => domain.label === el.getAttribute('id'))
    domains[findIndex].selector = el.value;
  })
  chrome.extension.sendMessage({ domains },(response) => { 
    console.log(response); 
  });
  e.preventDefault()
}