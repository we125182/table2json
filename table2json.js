let domain = {}

document.body.classList.add('table2json')
chrome.storage.sync.get([location.host], function(result) {
    domain = result[location.host]
    observeDOMChange()
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    domain = request
    clearInsert()
    sendResponse('success')
})

function clearInsert() {
    Array.from(document.querySelectorAll('table-target')).forEach(node => {
        const insertNode = node.querySelector('.export-button-wrap')
        node.remove(insertNode)
    })
}

function observeDOMChange() {
    const observer = new MutationObserver(function(mutationList, observer) {
        const tableElList = Array.from(document.querySelectorAll(domain.selector)).filter(node => !node.classList.contains('table-target'))
        if (tableElList.length) {
            tableElList.forEach(node => {
                node.classList.add('table-target')
                node.parentElement.prepend(tableToolBar(node))
            })
        }
    })

    observer.observe(document.body, {
        subtree: true, childList: true
    })
}

function formatTr(trEl) {
    return Array.prototype.slice.call(trEl.children).reduce((pre, th) => {
        pre.push(th.innerText)
        return pre
    }, [])
}

function formatThead(tableEl) {
    const thead = tableEl.querySelector('thead')
    const tr = thead.querySelector('tr')
    const propList = formatTr(tr)
    const propIndex = propList.findIndex(prop => prop === domain.prop)
    const labelIndex = propList.findIndex(prop => prop === domain.label)
    return {
        labelIndex,
        propIndex
    }
}

function formatBody(tableEl) {
    const thead = tableEl.querySelector('tbody')
    const trList = thead.querySelectorAll('tr')
    const rowList = []
    trList.forEach(tr => {
        rowList.push(formatTr(tr))
    })
    return rowList
}

function tableToolBar(tableEl) {
    const toolBar = document.createElement('div')
    toolBar.className = 'export-button-wrap'
    toolBar.append(exportButton('转Object', export2obj, tableEl))
    toolBar.append(exportButton('转Array', export2arr, tableEl))
    return toolBar
}

function exportButton(name, fn, scope) {
    const button = document.createElement('button')
    button.classList.add('export-button')
    button.innerText = name
    button.onclick = function () {
        fn(scope)
    }
    return button
}

function export2obj(tableEl) {
    const { labelIndex, propIndex } = formatThead(tableEl)
    if (propIndex === -1) {
        setTimeout(showNotification('error'), 2000)
        return
    }
    const rowList = formatBody(tableEl)
    const rowStrList = rowList.map(row => {
        return row[labelIndex] ? `  ${row[propIndex]}: '', // ${row[labelIndex]}` : `  ${row[propIndex]}: '',`
    })
    rowStrList.unshift('{')
    rowStrList.push('}')
    const content = rowStrList.join('\n')
    copy2clipboard(content)
}

function export2arr(tableEl) {
    const { labelIndex, propIndex } = formatThead(tableEl)
    if (propIndex === -1) {
        setTimeout(showNotification('error'), 2000)
        return
    }
    const rowList = formatBody(tableEl)
    const columns = rowList.map(row => {
        return {
            label: row[labelIndex],
            prop: row[propIndex]
        }
    })
    const content = JSON.stringify(columns, null, 2)
    copy2clipboard(content)
}

function copy2clipboard(content) {
    console.log(content)
    if (navigator.clipboard) {
        navigator.clipboard.writeText(content)
            .then(() => {
                setTimeout(showNotification('success'), 2000)
            })
            .catch(err => {
                // This can happen if the user denies clipboard permissions:
                // 如果用户没有授权，则抛出异常
                console.error('无法复制此文本：', err);
            });
    }
}

function showNotification(type) {
    const typeMap = {
        success: {
            label: '成功',
            value: '已复制到剪切板'
        },
        error: {
            label: '错误',
            value: `未找到 "${domain.prop}" 对应的列`
        }
    }
    const wrapper = document.createElement('div')
    wrapper.className = 'notification-wrapper'
    const typeObj = typeMap[type]
    wrapper.innerHTML = `
    <div class="notification-title is-${type}">${typeObj.label}</div>
    <div class="notification-content">${typeObj.value}</div>
    `
    document.body.append(wrapper)
    return function() {
        wrapper.remove(wrapper)
    }
}