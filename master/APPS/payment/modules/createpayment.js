'use strict';

(function () {
    let products = [];
    let drivers = [];
    let partChallan = [];
    let vendor = [];
    let removeItems = [];
    let allReadyPay = 0;
    init();

    async function init() {
        getDriver();
        getProducts();
        getvendor();
        getTruck();
        bindEvents();
    }

    function bindEvents() {
        $('#full_challan_form').on('click', '#closePopup,.cancelBtn', function () {
            window.location.replace("/master/index.html#/payment");
        });
        $('.submitSearch').on('click', submitSeachFrom);
        $('#full_challan_form').on('change', '.qItemNoQuantity,.qItemPrice', function () {
            calculateSingleItem($(this).closest('.quotationItem'));
        });
        $('#full_challan_form').on('keyup', '.qItemNoQuantity,.qItemPrice', function () {
            calculateSingleItem($(this).closest('.quotationItem'));
        });
        $('#full_challan_form').on('change', '.qDiscount', calculateTotal);
        $('#full_challan_form').on('keyup', '.qDiscount', calculateTotal);
        $('#full_challan_form').on('keyup', '.qPayable', calculateTotal);
        $('#full_challan_form').on('click', '.saveBtn', savePayment);
    }

    function getTruck() {
        let cnd = [{ 'key': 'status', 'operator': 'is', 'value': 0 }];
        backendSource.getObject('part_challan', null, { where: cnd }, function (data) {
            if (data.SUCCESS) {
                if (data.MESSAGE.length > 0) {
                    partChallan = data.MESSAGE;
                   $('#vendor').html('');
                    let html = '<option value="">Select Challan</option>'
                    partChallan.forEach((t) => {
                        html += `<option value="${t.id}">challan ${t.id}</option>`
                    });
                    $('#vendor').html(html);
                }
            }
        });
    }

    async function submitSeachFrom() {
        let from = $('#fDate').val();
        let to = $('#tDate').val();
        let challan = $('#vendor').find(":selected").val()
        let cnd = [];
        let singleChallan=''
        // if (!from || from == '') {
        //     DM_TEMPLATE.showSystemNotification(0, `Select From Date.`);
        //     return;
        // }
        // if (!to || to == '') {
        //     DM_TEMPLATE.showSystemNotification(0, `Select To Date.`);
        //     return;
        // }
        if (!challan || challan == '') {
            DM_TEMPLATE.showSystemNotification(0, `please! Select challan .`);
            return;
        }
        if (from && from != '') {
            cnd.push({ 'key': 'date', 'operator': 'higher-equal', 'value': from + ' 00:00:00' });
        }
        if (to && to != '') {
            cnd.push({ 'key': 'date', 'operator': 'lower-equal', 'value': to + ' 23:59:59' });
        }
        if (challan && challan != '') {
            cnd.push({ 'key': 'part_challan_id', 'operator': 'is', 'value': challan });
            singleChallan = partChallan.find((pc)=>pc.id==challan)
        }
        backendSource.getObject('payment',null,{
            where: [{ 'key': 'part_challan_id', 'operator': 'is', 'value': challan }]
        },function (data) {
            if (data.SUCCESS) {
                allReadyPay = data.MESSAGE.reduce((acc, p) => acc = acc + p.payable_amount,0);
            }
        })
        backendSource.getObject('dispatch_item', null, { 
            where: cnd,
         }, function (data) {
            if (data.SUCCESS) {
                if (data.MESSAGE.length > 0) {
                    console.log(data.MESSAGE);
                    showForm(data.MESSAGE,singleChallan)
                } else {
                    $("#full_challan_form").html(`<div class="text-center fw-bold fs-3">Sorry No dispatch found</div>`)
                }
            }
        })
    }
    function showForm(dispatch,challan) {
        let cOpt = `<option value="">Select vendor</option>`;
        vendor.map((e) => {
            cOpt += `<option value="${e.id}" ${challan && challan.vendor_id == e.id ? `selected` : ``}>${e.name}</option>`;
        });
        $("#full_challan_form").html(`
            <div class="row">
            <div class="col-2 mt-3 text-end">Vendor</div>
            <div class="col-4 mt-3 input-container">
             <select class="qVendor" readonly disabled>
               ${cOpt}
             </select>
            </div>
            <div class="col-2 mt-3 text-end">Payment Date</div>
            <div class="col-4 mt-3 input-container">
              <input type="date" class="qDate"  value=""/>
            </div>
 
            <div class="col-2 mt-3 text-end">Description</div>
            <div class="col-4 mt-3 input-container">
              <textarea  class="qDescription"></textarea>
            </div>
            
            <div class="col-6 mt-3"></div>
            
            <div class="col-12 my-3 qItemArea">
              <div class="row quotationItem head">
              
                <div class="col-3 input-container">Products</div>
                <div class="col-2 input-container">Quantity</div>
                <div class="col-2 input-container">Unit Price</div>
                <div class="col-2 input-container">Total </div>
              </div>
            </div>

            <div class="col-12 my-3">
              <div class="row quotationTotal head ">
                <div class="col-8 input-container text-end">Sub Total</div>
                <div class="col-3 input-container"><input type="number"  class="qSubTotal" value=""/></div>
                <div class="col-1 input-container">&nbsp;</div>
                <div class="col-8 input-container text-end">All ready pay</div>
                <div class="col-3 input-container"><input type="number" class="qPayableAllred" readonly value="${allReadyPay}"/></div>
                <div class="col-1 input-container">&nbsp;</div>
                <div class="col-8 input-container text-end">Payment</div>
                <div class="col-3 input-container"><input type="number" class="qPayable" value=""/></div>
                <div class="col-1 input-container">&nbsp;</div>
                <div class="col-8 input-container text-end">Due Amount </div>
                <div class="col-3 input-container"><input type="number"  class="qTotal" value=""/></div>
                <div class="col-1 input-container">&nbsp;</div>
              </div>
            </div>

            <div class="col-4 mt-3">&nbsp;</div>
            <div class="col-8 mt-3">
              <span class="gameButton saveBtn mx-3"> Save </span>
              <span class="gameButton cancelBtn"> Cancel </span>
              <input type="hidden" class="uId" value=""/>
              <input type="hidden" class="partChallanId" value="${challan.id}"/>
            </div>
          </div>
        </div>
        </div>`);

                    if (dispatch) {
                        for (let i in dispatch) {
                            addQuotationItem(dispatch[i]);
                        }
                    }

    }
    function addQuotationItem(item, partChallanId) {
        console.log(item)
        let pOpt = `<option value="">Select Product</option>`;
        products.map((e) => {
            pOpt += `<option data-base_cost="${e.base_cost}" value="${e.id}" ${item && item.product_id == e.id ? `selected` : ``}>${e.name} (${e.weight}kg)</option>`;
        });
        $('.qItemArea').append(`
            <div class="row quotationItem item" data-itemid="" >
 
        <div class="col-3 input-container">
          <select  class="qItemProduct" disabled >${pOpt}</select>
        </div>
        <div class="col-2 input-container">
          <input type="number" class="qItemNoQuantity" readonly  value="${item ? item.quantity : '1'}"/>
        </div>
        <div class="col-2 input-container">
          <input type="number" class="qItemPrice" readonly  value="${item ? item.unit_price : '1'}"/>
        </div>
        <div class="col-2 input-container">
          <input type="number" readonly  class="qItemTotal"  value="${item ? item.total: '1'}"/>
        </div>
      </div>`);
        calculateTotal()
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
    function getDriver() {
        let cnd = [{ 'key': 'status', 'operator': 'is', 'value': 1 }];
        backendSource.getObject('driver', null, { where: cnd }, function (data) {
            if (data.SUCCESS) {
                if (data.MESSAGE.length > 0) {
                    drivers = data.MESSAGE;
                }
            }
        });
    }
    function calculateTotal() {
        let tot = 0;
        $('#full_challan_form').find('.qItemTotal').each(function (i, obj) {
            if (parseFloat($(this).val()) > 0) {
                tot += parseFloat($(this).val());
            }
        });
        let pay = $('#full_challan_form').find('.qPayable').val();
        let alreadypay = $('#full_challan_form').find('.qPayableAllred').val();
        pay = parseFloat(pay) > 0 ? parseFloat(pay) : 0;
        alreadypay = parseFloat(alreadypay) > 0 ? parseFloat(alreadypay) : 0;
        $('#full_challan_form').find('.qSubTotal').val(tot);
        console.log(tot)
        $('#full_challan_form').find('.qTotal').val(tot - (pay+alreadypay));

    }

    function calculateSingleItem(cntr) {
        let qnt = parseFloat($(cntr).find('.qItemNoQuantity').val());
        let price = parseFloat($(cntr).find('.qItemPrice').val());
        if ($(cntr).find('.qItemProduct').val() == '') price = 0;
        $(cntr).find('.qItemTotal').val((qnt * price));
        calculateTotal();
    }
    async function savePayment() {
        let id = $('.uId').val();
        let from = $('.qFrom').val();
        let to = $('.qTo').val();
        let subTotal = $('.qSubTotal').val();
        let partChallanId = $('.partChallanId').val();
        let date = $('.qDate').val()

        if (!date || date == '') {
            DM_TEMPLATE.showSystemNotification(0, `Please select a date .`);
            return;
        }
        DM_TEMPLATE.showBtnLoader(elq('.saveBtn'), true);
        backendSource.saveObject('payment', id && id.trim() != '' ? id : null, {
            from: from,
            to: to,
            total: subTotal,
            due: $('.qTotal').val(),
            payable_amount: $('.qPayable').val(),
            date: date,
            note: $('.qDescription').val(),
            vendor: $('.qVendor').val(),
            part_challan_id :partChallanId
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
                $('#full_challan_form').find('.quotationItem.item').each(function (i, obj) {
                    let prod = $(this).find('.qItemProduct').val();
                    let qnt = $(this).find('.qItemNoQuantity').val();
                    let price = $(this).find('.qItemPrice').val();
                    let total = $(this).find('.qItemTotal').val();
                    let oId = $(this).attr('data-itemid');
                    if (prod && prod != '') {
                        let tItem = {
                            BACKEND_ACTION: 'update',
                            quantity: qnt && qnt != '' ? qnt : 1,
                            unit_price: price && price != '' ? price : 0,
                            total: total && total != '' ? total : 0,
                            product_id: prod,
                            payment_id: data.MESSAGE,
                            ID_RESPONSE: i
                        }
                        if (oId && oId != '') {
                            tItem['id'] = oId;
                        }
                        patchArr.push(tItem);
                    }
                    console.log(patchArr);
                });
                backendSource.patch('payment_item', patchArr, function (res) {
                    DM_TEMPLATE.showSystemNotification(1, `payment updated successfully.`);
                    setTimeout(function () {
                        window.location.replace("/master/index.html#/payment");
                    }, 1000);
                });
            } else {
                DM_TEMPLATE.showSystemNotification(0, `Unable to update. Please try again.`);
            }
            DM_TEMPLATE.showBtnLoader(elq('.saveBtn'), false);
        });
    }
    function getvendor() {
        let cnd = [{ 'key': 'status', 'operator': 'is', 'value': 1 }];
        backendSource.getObject('vendor', null, { where: cnd }, function (data) {
            if (data.SUCCESS) {
                if (data.MESSAGE.length > 0) {
                    vendor = data.MESSAGE;
                   
                }
            }
        });
    }
})();