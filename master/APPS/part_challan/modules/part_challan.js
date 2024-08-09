'use strict';

(function () {

    const popup = document.getElementById("sitePopup");
    let partChallanJson = [];
    let clients = [];
    let products = [];
    let removeItems = [];
    let DATALIMIT = 15;
    let DATASTART = 0;
    let settings = '';
    init();

    async function init() {
        $('#iDfrom').val(moment(new Date()).format('YYYY-01-01'));
        $('#iDto').val(moment(new Date()).format('YYYY-12-31'));
        getClients();
        getProducts();
        getChallan();
        getSettings();
        bindEvents();
    }

    function bindEvents() {
        $('#sitePopup').off('click');
        $('#sitePopup').on('click', '#closePopup,.cancelBtn', function () {
            popup.style.display = "none";
        });
        $('.createChallan').on('click', challanPopup);
        $('#sitePopup').on('click', '.newItemBtn', function () {
            addProduct();
        });
        $('#sitePopup').on('click', '.bi-trash', removeItem);
        $('#sitePopup').on('click', '.saveBtn', savePartChallan);
        $('.searchChallan').on('click', getChallan);
        $('#tblChallan').on('click', `[data-editid]`, challanPopup);
        $('#tblChallan').on('click', `[data-statusid]`, statusPopup);
        $('#sitePopup').on('click', '.statusSaveBtn', statusSave);
        $('#tblChallan').on('click', `[data-printid]`, printChallan);
        $('.container').on('click', `.Next`, function () {
            DATASTART = DATASTART + DATALIMIT;
            getChallan()
        });
        $('.container').on('click', `.Previous`, function () {
            if (DATASTART > 0) {
                DATASTART = DATASTART - DATALIMIT;
                getChallan()
            }
        });
    }

    function getChallan() {
        DM_TEMPLATE.showBtnLoader(elq('.searchChallan'), true);
        let qId = $('#iId').val();
        let iDto = $('#iDto').val();
        let iDfrom = $('#iDfrom').val();
        let iStatus = $('#iStatus').find(":selected").val();
        let iClient = $('#iClient').find(":selected").val();
        let cnd = [];
        let lim = {
            start: DATASTART,
            end: DATASTART + DATALIMIT
        }
        if (qId && qId != '') {
            cnd.push({ 'key': 'code', 'operator': 'like', 'value': qId });
        }
        if (iDfrom && iDfrom != '') {
            cnd.push({ 'key': 'date', 'operator': 'higher-equal', 'value': iDfrom + ' 00:00:00' });
        }
        if (iDto && iDto != '') {
            cnd.push({ 'key': 'date', 'operator': 'lower-equal', 'value': iDto + ' 23:59:59' });
        }
        if (iClient && iClient != '') {
            cnd.push({ 'key': 'vendor_id', 'operator': 'is', 'value': iClient })
        }
        if (iStatus != '-1') {
            cnd.push({ 'key': 'innoice##status', 'operator': 'is', 'value': iStatus })
        }
        backendSource.getObject('part_challan', null, {
            where: cnd,
            limit: lim,
            order: {
                type: 'desc',
                by: 'id'
            },
            reference: [{ obj: 'vendor', a: 'id', b: 'vendor_id' }],
            select: "part_challan.*, vendor.name vName"
        }, function (data) {
            if (data.SUCCESS) {
                partChallanJson = data.MESSAGE;
                console.log(partChallanJson);
                $('#tblChallan tbody').html('');
                if (data.MESSAGE.length > 0) {
                    data.MESSAGE.map((e) => {
                        $('#tblChallan tbody').append(`
              <tr>
                <td>${e.id}</td>
                <td>${e.code}</td>
                <td>${e.vName}</td>
                <td >${moment(e.date).format('DD-MM-YYYY')}</td>
                <td >${e.description}</td>
                <td >
                    <div style="display:flex;justify-content: start">
                        <span class="actionBtn" data-printid="${e.id}"><i class="bi bi-printer"></i></span>
                        <span class="actionBtn" data-editid="${e.id}"><i class="bi bi-pencil-square"></i></span>
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

    function getClients() {
        let cnd = [{ 'key': 'status', 'operator': 'is', 'value': 1 }];
        backendSource.getObject('vendor', null, { where: cnd }, function (data) {
            if (data.SUCCESS) {
                $('#iClient').html('<option value="">Select vendor</option>');
                if (data.MESSAGE.length > 0) {
                    clients = data.MESSAGE;
                    data.MESSAGE.map((e) => {
                        $('#iClient').append(`
              <option value="${e.id}">${e.name}</option>
            `);
                    });
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

    function removeItem() {
        let itemId = $(this).closest('.quotationItem').attr('data-itemid');
        if (itemId && itemId != '') removeItems.push(itemId);
        $(this).closest('.quotationItem').remove();
        calculateTotal();
    }


    function challanPopup() {
        const uid = $(this).attr('data-editid');
        const challan = partChallanJson.find((e) => { return e.id == uid });
        let cOpt = `<option value="">Select vendor</option>`;

        removeItems = [];

        clients.map((e) => {
            cOpt += `<option value="${e.id}" ${challan && challan.vendor_id == e.id ? `selected` : ``}>${e.name}</option>`;
        });


        $(`#sitePopup`).html(`<div class="popup-content" style="max-width:100%">
        <span class="close" id="closePopup">&times;</span>
        <h2>Part Challan</h2>
        <div class="container">
          <div class="row">
            <div class="col-2 mt-3 text-end">Challan Code</div>
            <div class="col-4 mt-3 input-container">
              <input type="text" class="qCode"  value="${challan ? challan.code : ''}"/>
            </div>
            <div class="col-2 mt-3 text-end">Vendor</div>
            <div class="col-4 mt-3 input-container">
              <select  class="qVendor">${cOpt}</select>
            </div>
 
            <div class="col-2 mt-3 text-end">Challan Date</div>
            <div class="col-4 mt-3 input-container">
              <input type="date" class="qDate"  value="${challan ? moment(challan.date).format('YYYY-MM-DD') : ''}"/>
            </div>
 

          
            <div class="col-2 mt-3 text-end">Description</div>
            <div class="col-4 mt-3 input-container">
              <textarea  class="qDescription">${challan ? challan.description : ''}</textarea>
            </div>
          
            
            <div class="col-12 my-3 qItemArea">
              <div class="row quotationItem head">
                <div class="col-3 input-container">Products</div>
                <div class="col-2 input-container">Quantity</div>
                <div class="col-1 input-container">Action</div>
              </div>
            </div>

            <div class="col-4 mt-3">&nbsp;</div>
            <div class="col-8 mt-3">
              <span class="gameButton newItemBtn mx-3"> Add new item </span>
              <span class="gameButton saveBtn mx-3"> Save </span>
              <span class="gameButton cancelBtn"> Cancel </span>
              <input type="hidden" class="uId" value="${challan ? challan.id : ''}"/>
            </div>
          </div>
        </div>
      </div>`);

        popup.style.display = "block";
        if (challan) {
            backendSource.getObject('part_challan_item', null, {
                where: [{ 'key': 'part_challan_id', 'operator': 'is', 'value': challan.id }]
            }, function (data) {
                if (data.SUCCESS) {
                    for (let i in data.MESSAGE) {
                        addProduct(data.MESSAGE[i]);
                    }
                }
            })
        } else {
            addProduct();
        }
    }

    function addProduct(item) {
        console.log(item)
        let pOpt = `<option value="">Select Product</option>`;
        products.map((e) => {
            pOpt += `<option data-base_cost="${e.base_cost}" value="${e.id}" ${item && item.product_id == e.id ? `selected` : ``}>${e.name} (${e.weight}kg)</option>`;
        });
        $('.qItemArea').append(`<div class="row quotationItem item" data-itemid="${item ? item.id : ''}">
        <div class="col-3 input-container">
          <select  class="cItemProduct">${pOpt}</select>
        </div>
        <div class="col-2 input-container">
          <input type="number" class="cItemNoQuantity"  value="${item ? item.quantity : '1'}"/>
        </div>
       <div class="col-1 input-container"><span><i class="bi bi-trash"></i></span></div> 
      </div>`);
        $('#sitePopup').find('.popup-content').scrollTop($('#sitePopup').height())
    }

    async function savePartChallan() {
        let id = $('.uId').val();
        let client_id = $('.qVendor').val();
        let code = $('.qCode').val();
   

        if (!client_id || client_id == '') {
            DM_TEMPLATE.showSystemNotification(0, `Select the vendor.`);
            return;
        }

        if (!code || code == '') {
            DM_TEMPLATE.showSystemNotification(0, `Provide the invoie Code.`);
            return;
        }

        DM_TEMPLATE.showBtnLoader(elq('.saveBtn'), true);
        console.log({
            vendor_id: client_id,
            code: code,
            date: $('.qDate').val(),
            description: $('.qDescription').val(),
        })
        backendSource.saveObject('part_challan', id && id.trim() != '' ? id : null, {
            vendor_id: client_id,
            code: code,
            date: $('.qDate').val(),
            description: $('.qDescription').val(),
        }, function (data) {
            if (data.SUCCESS) {
                let patchArr = [];
                for (let i in removeItems) {
                    patchArr.push({
                        BACKEND_ACTION: 'delete',
                        id: removeItems[i],
                        ID_RESPONSE: removeItems[i]
                    });
                }
                $('#sitePopup').find('.quotationItem.item').each(function (i, obj) {
                    let prod = $(this).find('.cItemProduct').val();
                    let qnt = $(this).find('.cItemNoQuantity').val();
                    let oId = $(this).attr('data-itemid');
                    if (prod && prod != '') {
                        let tItem = {
                            BACKEND_ACTION: 'update',
                            quantity: qnt && qnt != '' ? qnt : 1,
                            product_id: prod,
                            part_challan_id: data.MESSAGE,
                            ID_RESPONSE: i
                        }
                        if (oId && oId != '') {
                            tItem['id'] = oId;
                        }
                        patchArr.push(tItem);
                    }
                });
                backendSource.patch('part_challan_item', patchArr, function (res) {
                    DM_TEMPLATE.showSystemNotification(1, `Challan updated successfully.`);
                    popup.style.display = "none";
                    setTimeout(function () {
                        window.location.reload();
                    }, 1000);
                });
            } else {
                DM_TEMPLATE.showSystemNotification(0, `Unable to update. Please try again.`);
            }
            DM_TEMPLATE.showBtnLoader(elq('.saveBtn'), false);
        });
    }

    function statusPopup() {
        const uid = $(this).attr('data-statusid');
        const challan = partChallanJson.find((e) => { return e.id == uid });
        $(`#sitePopup`).html(`<div class="popup-content">
        <span class="close" id="closePopup">&times;</span>
        <h2>Change status</h2>
        <div class="container">
          <div class="row">
            <div class="col-4 mt-3">Challan</div>
            <div class="col-8 mt-3 input-container">${challan ? challan.code : ''} / ${challan ? moment(challan.i_date).format('DD-MM-YYYY') : ''}</div>
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

            backendSource.saveObject('part_challan', id, {
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
        const challan = partChallanJson.find((e) => { return e.id == uid });
        if (challan) {
            backendSource.getObject('part_challan_item', null, {
                where: [{ 'key': 'part_challan_id', 'operator': 'is', 'value': challan.id }]
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
                    text: `Challan Products`,
                    fontSize: 16,
                    width: '100%',
                    bold: true,
                    alignment: "center",
                    margin:20
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
                        widths: ['15%','60%', "25%"],
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
