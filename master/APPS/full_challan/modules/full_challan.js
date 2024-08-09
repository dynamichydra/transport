'use strict';

(function () {

    const popup = document.getElementById("sitePopup");
    let fullChallan = [];
    let DATALIMIT = 15;
    let DATASTART = 0;
    let settings = '';
    let products = [];
    init();

    async function init() {
        $('#iDfrom').val(moment(new Date()).format('YYYY-01-01'));
        $('#iDto').val(moment(new Date()).format('YYYY-12-31'));
        getInvoice();
        getProducts();
        getSettings()
        bindEvents();
    }

    function bindEvents() {
        $('#sitePopup').off('click');
        $('#sitePopup').on('click', '#closePopup,.cancelBtn', function () {
            popup.style.display = "none";
        });
        $('.searchChallan').on('click', getInvoice);
        $('#tblChallan').on('click', `[data-statusid]`, statusPopup);
        $('#sitePopup').on('click', '.statusSaveBtn', statusSave);
        $('#tblChallan').on('click', `[data-printid]`, printChallan);
        $('.container').on('click', `.Next`, function () {
            DATASTART = DATASTART + DATALIMIT;
            getInvoice()
        });
        $('.container').on('click', `.Previous`, function () {
            if (DATASTART > 0) {
                DATASTART = DATASTART - DATALIMIT;
                getInvoice()
            }
        });
    }

    function getInvoice() {
        DM_TEMPLATE.showBtnLoader(elq('.searchChallan'), true);
        let cId = $('#iCode').val();
        let iDto = $('#iDto').val();
        let iDfrom = $('#iDfrom').val();
        let iStatus = $('#iStatus').find(":selected").val();
        let cnd = [];
        let lim = {
            start: DATASTART,
            end: DATASTART + DATALIMIT
        }
        if (cId && cId != '') {
            cnd.push({ 'key': 'code', 'operator': 'like', 'value': cId });
        }
        if (iDfrom && iDfrom != '') {
            cnd.push({ 'key': 'date', 'operator': 'higher-equal', 'value': iDfrom + ' 00:00:00' });
        }
        if (iDto && iDto != '') {
            cnd.push({ 'key': 'date', 'operator': 'lower-equal', 'value': iDto + ' 23:59:59' });
        }
        if (iStatus != '-1') {
            cnd.push({ 'key': 'full_challan##status', 'operator': 'is', 'value': iStatus })
        }
        backendSource.getObject('full_challan', null, {
            where: cnd,
            limit: lim,
            order: {
                type: 'desc',
                by: 'id'
            },
            reference: [{ obj: 'driver', a: 'id', b: 'driver_id' }, { obj: 'truck', a: 'id', b: 'truck_id' }],
            select: "full_challan.*, driver.name dName, truck.name tName"
        }, function (data) {
            if (data.SUCCESS) {
                fullChallan = data.MESSAGE;
                console.log(fullChallan);
                $('#tblChallan tbody').html('');
                if (data.MESSAGE.length > 0) {
                    data.MESSAGE.map((e) => {
                        $('#tblChallan tbody').append(`
              <tr>
                <td>${e.id}</td>
                <td>${e.code}</td>
                <td>${e.dName}</td>
                <td>${e.tName}</td>
                <td >${moment(e.date).format('DD-MM-YYYY')}</td>
                <td >${e.from}</td>
                <td >${e.to}</td>
                
                <td >${e.status == 1 ? '<span class="confirm">Confirm</span>' : (e.status == 2 ? '<span class="cancel">Cancel</span>' : (e.status == 3 ? '<span class="complete">Complete</span>' : '<span class="pending">Pending</span>'))}</td>
                <td>
                <div style="display:flex;justify-content:start">
                    <span class="actionBtn" data-printid="${e.id}"><i class="bi bi-printer"></i></span>
                    <span class="actionBtn"> <a href="/master/index.html#/full_challan/editfullchallan/${e.id}"><i class="bi bi-pencil-square"></i></a></span>
                    ${e.status == 3 ?"":`<span class="actionBtn"> <a href="/master/index.html#/dispatch/createdispatch/${e.id}"><i class="bi bi-truck"></i></a></span>`}
                    <span class="actionBtn" data-statusid="${e.id}"><i class="bi ${e.status == 1 ? 'bi-lock' : 'bi-unlock'}"></i></span>
                </div>
                </td>
              </tr>
            `);
                    });
                } else {
                    $('#tblChallan tbody').append(`
              <tr>
                <td colspan="8" class="text-center">No record found</td>
              </tr>
            `);
                }
            }
            DM_TEMPLATE.showBtnLoader(elq('.searchChallan'), false);
        });
    }
    function getSettings() {
        let cnd = [];
        backendSource.getObject('settings', null, { where: cnd }, function (data) {
            if (data.SUCCESS) {
                if (data.MESSAGE.length > 0) {
                    // console.log(data);
                    settings = data.MESSAGE.at(-1);
                }
            }
        });
    }
    function getProducts() {
        let cnd = [{ 'key': 'status', 'operator': 'is', 'value': 1 }];
        backendSource.getObject('product', null, { where: cnd }, function (data) {
            if (data.SUCCESS) {
                if (data.MESSAGE.length > 0) {
                    products = data.MESSAGE;
                }
            }
        });
    }
    function statusPopup() {
        const uid = $(this).attr('data-statusid');
        const challan = fullChallan.find((e) => { return e.id == uid });
        $(`#sitePopup`).html(`<div class="popup-content">
        <span class="close" id="closePopup">&times;</span>
        <h2>Change status</h2>
        <div class="container">
          <div class="row">
            <div class="col-4 mt-3">Challan</div>
            <div class="col-8 mt-3 input-container">${challan ? challan.code : ''} / ${challan ? moment(challan.date).format('DD-MM-YYYY') : ''}</div>
            <div class="col-4 mt-3">Status</div>
            <div class="col-8 mt-3 input-container">
            <select type="text" class="cStatus">
              <option ${challan && challan.status == 2 ? 'selected' : ''} value="2">Cancel</option>
              <option ${challan && challan.status == 0 ? 'selected' : ''} value="0">Pending</option>
              <option ${challan && challan.status == 3 ? 'selected' : ''} value="3">Complete</option>
            </select>
            <input type="hidden" class="uId" value="${challan ? challan.id : ''}"/>
            </div>
            <div class="col-4 mt-3">&nbsp;</div>
            <div class="col-8 mt-3"><span class="gameButton statusSaveBtn"> Save </span></div>
          </div>
        </div>
      </div>`);

        popup.style.display = "block";
    }

    async function statusSave() {
        DM_TEMPLATE.showBtnLoader(elq('.statusSaveBtn'), true);
        let id = $('.uId').val();
        if (id && id.trim() != '') {

            backendSource.saveObject('full_challan', id, {
                status: $('.cStatus').find(":selected").val()
            }, function (data) {
                DM_TEMPLATE.showBtnLoader(elq('.statusSaveBtn'), false);
                if (data.SUCCESS) {
                    DM_TEMPLATE.showSystemNotification(1, `Status updated successfully.`);
                    popup.style.display = "none";
                    setTimeout(function () {
                        window.location.reload();
                    }, 1000);
                } else {
                    DM_TEMPLATE.showSystemNotification(0, `Unable to update. Please try again.`);
                }
            });
        }
    }
    function printChallan() {
        const uid = $(this).attr('data-printid');
        const challan = fullChallan.find((e) => { return e.id == uid });
        if (challan) {
            backendSource.getObject('full_challan_item', null, {
                where: [{ 'key': 'full_challan_id', 'operator': 'is', 'value': challan.id }]
            }, function (data) {
                if (data.SUCCESS) {
                    createPrintTable(data.MESSAGE, challan);
                }
            })
        }
    }

    async function createPrintTable(item, challan) {
        let challanHeader = ["Sl No", "Product", "Quantity",];
        let tableHeader = [];
        let blob = await fetch("whitelabel/game/img/logo.png").then(r => r.blob());
        let dataUrl = await new Promise(resolve => {
            let reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });

        challanHeader.forEach((d) => {
            tableHeader.push({
                text: d,
                fontSize: 12,
                color: "white",
                bold: true,
            })
        })

        let challanData = [tableHeader];

        item.forEach((item, index) => {
            let product = products.find((e) => item.product_id == e.id)
            challanData.push([
                index + 1,
                { text: product && product.name, alignment: "left" },
                item ? item.quantity : '1',
            ])
        });
        let prop = {
            content: [
                {
                    image: dataUrl,
                    width: 150,
                },
                {
                    columns: [
                        {
                            style: 'tableExample',
                            width: '50%',
                            table: {
                                widths: ['100%'],
                                heights: [20, 10],
                                body: [
                                    [
                                        {
                                            text: `Address: ${settings.address}`,
                                            fontSize: 12,
                                        }
                                    ],
                                    [
                                        {
                                            text: `Phone Number: ${settings.ph}`,
                                            fontSize: 12,
                                        }
                                    ],
                                    [
                                        {
                                            text: `Email: ${settings.email}`,
                                            fontSize: 12,
                                        }
                                    ],
                                ],
                            },
                        },
                        {
                            style: 'tableExample',
                            width: '50%',
                            layout: {
                                fillColor: function (rowIndex, node, columnIndex) {
                                    return (rowIndex === 0) ? 'gray' : null;
                                }
                            },
                            table: {
                                widths: ['100%'],
                                heights: [20, 10],
                                body: [
                                    [
                                        {
                                            text: 'Part Challan',
                                            fontSize: 14,
                                            width: '100%',
                                            bold: true,
                                            color: "white",
                                            alignment: "center"
                                        }
                                    ],
                                    [
                                        {
                                            text: `Date: ${challan ? moment(challan.date).format('DD-MM-YYYY') : ''}`,
                                            fontSize: 12,
                                        }
                                    ],
                                    [
                                        {
                                            text: `Challan Number: ${challan ? challan.code : ""}`,
                                            fontSize: 12,
                                        }
                                    ],
                                ],
                            },
                        }
                    ],
                    columnGap: 10
                },
                {
                    columns: [
                        {
                            style: 'tableExample',
                            width: '100%',
                            margin: [0, 20, 0, 20],
                            layout: {
                                fillColor: function (rowIndex, node, columnIndex) {
                                    return (rowIndex === 0) ? 'gray' : null;
                                }
                            },
                            table: {
                                widths: ['100%'],
                                heights: [20, 10],
                                body: [
                                    [
                                        {
                                            text: 'Challan Address:',
                                            fontSize: 14,
                                            width: '100%',
                                            bold: true,
                                            color: "white",
                                            alignment: "center"
                                        }
                                    ],
                                    [
                                        {
                                            text: `From: ${challan ? challan.from : ''}`,
                                            fontSize: 12,
                                        }
                                    ],
                                    [
                                        {
                                            text: `To: ${challan ? challan.to : ''}`,
                                            fontSize: 12,
                                        }
                                    ],
                                ],
                            },
                        }
                    ],
                    columnGap: 10
                },
                {
                    text: `Challan Products`,
                    fontSize: 16,
                    width: '100%',
                    bold: true,
                    alignment: "center",
                    margin: 20
                },
                {
                    layout: {
                        fillColor: function (rowIndex, node, columnIndex) {
                            return (rowIndex === 0) ? 'gray' : null;
                        }
                    },
                    alignment: "center",
                    margin: [0, 10, 0, 20],
                    table: {
                        widths: ['15%', '60%', "25%"],
                        body: challanData
                    }
                },
                {
                    columns: [
                        {
                            style: 'tableExample',
                            width: '50%',
                            layout: 'noBorders',
                            margin: [0, 20, 0, 20],
                            table: {
                                widths: ['100%'],
                                body: [
                                    [
                                        {
                                            text: 'monir',
                                            fontSize: 12,
                                            bold: true,
                                        }
                                    ],
                                    [
                                        {
                                            text: `${settings.name}`,
                                            fontSize: 12,
                                        }
                                    ],
                                    [
                                        {
                                            text: `${settings.designation}`,
                                            fontSize: 12,
                                        }
                                    ],
                                ],
                            },
                        },
                    ],
                    columnGap: 10
                },
            ]
        }
        pdfMake.createPdf(prop).download();
    }
})();
