let domain = {
    selector: 'table',
    prop: '参数名',
    label: '说明'
}

document.body.classList.add('table2json')
observeDOMChange()

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    domain = request
    console.log(request)
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
    const rowList = formatBody(tableEl)
    const rowStrList = rowList.map(row => {
        return `  ${row[propIndex]}: '', // ${row[labelIndex]}`
    })
    rowStrList.unshift('{')
    rowStrList.push('}')
    const content = rowStrList.join('\n')
    copy2clipboard(content)
}

function export2arr(tableEl) {
    const { labelIndex, propIndex } = formatThead(tableEl)
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
                // alert('已复制到剪切板');
            })
            .catch(err => {
                // This can happen if the user denies clipboard permissions:
                // 如果用户没有授权，则抛出异常
                console.error('无法复制此文本：', err);
            });
    }
}