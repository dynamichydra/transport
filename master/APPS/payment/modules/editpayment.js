'use strict';

(function () {
    let products = [];
    let vendor=[]
    let truckArray = [];
    let removeItems = [];
    let allReadyPay = 0;
    console.log(get_param1);
    init();

    async function init() {
        getvendor()
        getProducts();
        getTruck();
        submitSeachFrom()
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
        $('#full_challan_form').on('click', '.saveBtn', saveFullchallan);
    }

    function getTruck() {
        let cnd = [{ 'key': 'status', 'operator': 'is', 'value': 1 }];
        backendSource.getObject('truck', null, { where: cnd }, function (data) {
            if (data.SUCCESS) {
                if (data.MESSAGE.length > 0) {
                    truckArray = data.MESSAGE;
                    $('#truck').html('');
                    let html = '<option value="">Select truck</option>'
                    truckArray.forEach((t) => {
                        html += `<option value="${t.id}">${t.name}(${t.number})</option>`
                    });
                    $('#truck').html(html);
                }
            }
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
    async function submitSeachFrom() {
        let from = $('#fDate').val();
        let to = $('#tDate').val();
        let truck = $('#truck').find(":selected").val()
        let cnd = [];

        backendSource.getObject('payment', get_param1, { where: cnd }, function (data) {
            if (data.SUCCESS) {
                backendSource.getObject('payment', null, {
                    where: [{ 'key': 'part_challan_id', 'operator': 'isnot', 'value': data.MESSAGE.part_challan_id }]
                }, function (data2) {
                    if (data2.SUCCESS) {
                        allReadyPay = data2.MESSAGE.reduce((acc, p) => acc = acc + p.payable_amount, 0);
                        showForm(data.MESSAGE)
                    }
                })
            }
        })
    }
    function showForm(data) {
        let cOpt = `<option value="">Select vendor</option>`;
        vendor.map((e) => {
            cOpt += `<option value="${e.id}" ${data && data.vendor == e.id ? `selected` : ``}>${e.name}</option>`;
        });
        $("#full_challan_form").html(`
            <div class="row">
            <div class="col-2 mt-3 text-end">Vendor</div>
            <div class="col-4 mt-3 input-container">
             <select class="qVendor" readonly disable>
               ${cOpt}
             </select>
            </div>
            <div class="col-2 mt-3 text-end">Payment Date</div>
            <div class="col-4 mt-3 input-container">
              <input type="date" class="qDate"  value="${data ? moment(data.date).format('YYYY-MM-DD') : ''}"/>
            </div>
            
            <div class="col-2 mt-3 text-end">Description</div>
            <div class="col-4 mt-3 input-container">
              <textarea  class="qDescription">${data && data.note}</textarea>
            </div>
            
            <div class="col-6 mt-3"></div>
            
            <div class="col-12 my-3 qItemArea">
              <div class="row quotationItem head">
              
                <div class="col-3 input-container">Products</div>
                <div class="col-2 input-container">Quantity</div>
                <div class="col-2 input-container">Unit Price</div>
                <div class="col-2 input-container">Price </div>
              </div>
            </div>

            <div class="col-12 my-3">
              <div class="row quotationTotal head ">
                <div class="col-8 input-container text-end">Sub Total</div>
                <div class="col-3 input-container"><input type="number"  class="qSubTotal" value="${data&&data.total}"/></div>
                <div class="col-1 input-container">&nbsp;</div>
                <div class="col-8 input-container text-end">All ready pay</div>
                <div class="col-3 input-container"><input type="number" class="qPayableAllred" readonly value="${allReadyPay}"/></div>
                <div class="col-1 input-container">&nbsp;</div>
                <div class="col-8 input-container text-end">Payment</div>
                <div class="col-3 input-container"><input type="number" class="qPayable" value="${data&&data.payable_amount}"/></div>
                <div class="col-1 input-container">&nbsp;</div>
                <div class="col-8 input-container text-end">Due Amount </div>
                <div class="col-3 input-container"><input type="number"  class="qTotal" value="${data&&data.due}"/></div>
                <div class="col-1 input-container">&nbsp;</div>
              </div>
            </div>

            <div class="col-4 mt-3">&nbsp;</div>
            <div class="col-8 mt-3">
              <span class="gameButton saveBtn mx-3"> Save </span>
              <span class="gameButton cancelBtn"> Cancel </span>
              <input type="hidden" class="uId" value="${data.id}"/>
            </div>
          </div>
        </div>
        </div>`);

        if (data) {
            backendSource.getObject('payment_item', null, {
                where: [{ 'key': 'payment_id', 'operator': 'is', 'value': data.id }]
            }, function (data) {
                if (data.SUCCESS) {
                    for (let i in data.MESSAGE) {
                        addQuotationItem(data.MESSAGE[i]);
                    }
                }
            })
        }


    }
    function addQuotationItem(item) {
        console.log(item)
        let pOpt = `<option value="">Select Product</option>`;
        products.map((e) => {
            pOpt += `<option data-base_cost="${e.base_cost}" value="${e.id}" ${item && item.product_id == e.id ? `selected` : ``}>${e.name} (${e.weight}kg)</option>`;
        });
        $('.qItemArea').append(`
            <div class="row quotationItem item" data-itemid="${item?item.id:''}" >
 
        <div class="col-3 input-container">
          <select  class="qItemProduct" disabled>${pOpt}</select>
        </div>
        <div class="col-2 input-container">
          <input type="number" class="qItemNoQuantity" disabled  value="${item ? item.quantity : '1'}"/>
        </div>
        <div class="col-2 input-container">
          <input type="number" class="qItemPrice" disabled  value="${item ? item.unit_price : '0'}"/>
        </div>
        <div class="col-2 input-container">
          <input type="number" readonly  class="qItemTotal"  value="${item ? item.total : '0'}"/>
        </div>
      </div>`);
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
        pay = parseFloat(pay) > 0 ? parseFloat(pay) : 0;
        $('#full_challan_form').find('.qSubTotal').val(tot);
        console.log(tot)
        $('#full_challan_form').find('.qTotal').val(tot - (pay));

    }

    function calculateSingleItem(cntr) {
        let qnt = parseFloat($(cntr).find('.qItemNoQuantity').val());
        let price = parseFloat($(cntr).find('.qItemPrice').val());
        if ($(cntr).find('.qItemProduct').val() == '') price = 0;
        $(cntr).find('.qItemTotal').val((qnt * price));
        calculateTotal();
    }

    async function saveFullchallan() {
        let id = $('.uId').val();
        let program_date_from = $('.qFrom').val();
        let program_date_to = $('.qTo').val();
        let subTotal = $('.qSubTotal').val();


        if (!subTotal || subTotal == '') {
            DM_TEMPLATE.showSystemNotification(0, `payment value can not zero.`);
            return;
        }
        DM_TEMPLATE.showBtnLoader(elq('.saveBtn'), true);
        backendSource.saveObject('payment', id && id.trim() != '' ? id : null, {
            from: program_date_from,
            to: program_date_to,
            total: subTotal,
            due: $('.qTotal').val(),
            payable_amount: $('.qPayable').val(),
            date: $('.qDate').val(),
            note: $('.qDescription').val(),
            vendor: $('.qVendor').val()
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

})();