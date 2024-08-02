'use strict';

(function () {

    const popup = document.getElementById("sitePopup");
    let invoices = [];
    let clients = [];
    let trucks = [];
    let products = [];
    let removeItems = [];
    let DATALIMIT = 15;
    let DATASTART = 0;
    init();

    async function init() {
        $('#iDfrom').val(moment(new Date()).format('YYYY-01-01'));
        $('#iDto').val(moment(new Date()).format('YYYY-12-31'));
        getClients();
        getProducts();
        getInvoice();
        bindEvents();
    }

    function bindEvents() {
        $('#sitePopup').off('click');
        $('#sitePopup').on('click', '#closePopup,.cancelBtn', function () {
            popup.style.display = "none";
        });
        $('.createQuotation').on('click', invoicePopup);
        $('#sitePopup').on('click', '.newItemBtn', function () {
            addQuotationItem();
        });
        $('#sitePopup').on('click', '.bi-trash', removeItem);
        $('#sitePopup').on('click', '.saveBtn', savePartChallan);
        $('.searchQuotation').on('click', getInvoice);
        $('#tblInvoice').on('click', `[data-editid]`, invoicePopup);
        $('#tblInvoice').on('click', `[data-statusid]`, statusPopup);
        $('#sitePopup').on('click', '.statusSaveBtn', statusSave);
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
        DM_TEMPLATE.showBtnLoader(elq('.searchQuotation'), true);
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
                invoices = data.MESSAGE;
                console.log(invoices);
                $('#tblInvoice tbody').html('');
                if (data.MESSAGE.length > 0) {
                    data.MESSAGE.map((e) => {
                        $('#tblInvoice tbody').append(`
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
                    $('#tblInvoice tbody').append(`
              <tr>
                <td colspan="8">No record found</td>
              </tr>
            `);
                }
            }
            DM_TEMPLATE.showBtnLoader(elq('.searchQuotation'), false);
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


    function removeItem() {
        let itemId = $(this).closest('.quotationItem').attr('data-itemid');
        if (itemId && itemId != '') removeItems.push(itemId);
        $(this).closest('.quotationItem').remove();
        calculateTotal();
    }


    function invoicePopup() {
        const uid = $(this).attr('data-editid');
        const invoice = invoices.find((e) => { return e.id == uid });
        let cOpt = `<option value="">Select vendor</option>`;

        removeItems = [];

        clients.map((e) => {
            cOpt += `<option value="${e.id}" ${invoice && invoice.vendor_id == e.id ? `selected` : ``}>${e.name}</option>`;
        });


        $(`#sitePopup`).html(`<div class="popup-content" style="max-width:100%">
        <span class="close" id="closePopup">&times;</span>
        <h2>Part Challan</h2>
        <div class="container">
          <div class="row">
            <div class="col-2 mt-3 text-end">Challan Code</div>
            <div class="col-4 mt-3 input-container">
              <input type="text" class="qCode"  value="${invoice ? invoice.code : ''}"/>
            </div>
            <div class="col-2 mt-3 text-end">Vendor</div>
            <div class="col-4 mt-3 input-container">
              <select  class="qVendor">${cOpt}</select>
            </div>
 
            <div class="col-2 mt-3 text-end">part Challan Date</div>
            <div class="col-4 mt-3 input-container">
              <input type="date" class="qDate"  value="${invoice ? moment(invoice.date).format('YYYY-MM-DD') : ''}"/>
            </div>
 

          
            <div class="col-2 mt-3 text-end">Description</div>
            <div class="col-4 mt-3 input-container">
              <textarea  class="qDescription">${invoice ? invoice.description : ''}</textarea>
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
              <span class="gameButton newItemBtn mx-3"> Add new Item </span>
              <span class="gameButton saveBtn mx-3"> Save </span>
              <span class="gameButton cancelBtn"> Cancel </span>
              <input type="hidden" class="uId" value="${invoice ? invoice.id : ''}"/>
            </div>
          </div>
        </div>
      </div>`);

        popup.style.display = "block";
        if (invoice) {
            backendSource.getObject('part_challan_item', null, {
                where: [{ 'key': 'part_challan_id', 'operator': 'is', 'value': invoice.id }]
            }, function (data) {
                if (data.SUCCESS) {
                    for (let i in data.MESSAGE) {
                        addQuotationItem(data.MESSAGE[i]);
                    }
                }
            })
        } else {
            addQuotationItem();
        }
    }

    function addQuotationItem(item) {
        console.log(item)
        let pOpt = `<option value="">Select Product</option>`;
        products.map((e) => {
            pOpt += `<option data-base_cost="${e.base_cost}" value="${e.id}" ${item && item.product_id == e.id ? `selected` : ``}>${e.name} (${e.weight}kg)</option>`;
        });
        $('.qItemArea').append(`<div class="row quotationItem item" data-itemid="${item ? item.id : ''}">
        <div class="col-3 input-container">
          <select  class="qItemProduct">${pOpt}</select>
        </div>
        <div class="col-2 input-container">
          <input type="number" class="qItemNoQuantity"  value="${item ? item.quantity : '1'}"/>
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
                    let prod = $(this).find('.qItemProduct').val();
                    let qnt = $(this).find('.qItemNoQuantity').val();
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
        const invoice = invoices.find((e) => { return e.id == uid });
        $(`#sitePopup`).html(`<div class="popup-content">
        <span class="close" id="closePopup">&times;</span>
        <h2>Change status</h2>
        <div class="container">
          <div class="row">
            <div class="col-4 mt-3">Invoice</div>
            <div class="col-8 mt-3 input-container">${invoice ? invoice.code : ''} / ${invoice ? moment(invoice.i_date).format('DD-MM-YYYY') : ''} / ${invoice ? invoice.due : ''}</div>
            <div class="col-4 mt-3">Status</div>
            <div class="col-8 mt-3 input-container">
            <select type="text" class="cStatus">
              <option ${invoice && invoice.status == 2 ? 'selected' : ''} value="2">Cancel</option>
              <option ${invoice && invoice.status == 0 ? 'selected' : ''} value="0">Pending</option>
              <option ${invoice && invoice.status == 3 ? 'selected' : ''} value="3">Complete</option>
            </select>
            <input type="hidden" class="uId" value="${invoice ? invoice.id : ''}"/>
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
        let invoice = invoices.find((i) => i.id == id);
        console.log(invoice);
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

})();
