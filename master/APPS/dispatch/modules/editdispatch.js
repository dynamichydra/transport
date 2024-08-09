'use strict';

(function () {
    let products = [];
    let drivers = [];
    let partChallan = [];
    let truckArray = [];
    let removeItems = [];
    console.log(get_param1);
    init();

    async function init() {
        getDriver();
        getProducts();
        getTruck();
        submitSeachFrom()
        bindEvents();
    }

    function bindEvents() {
        $('#dispatchForm').on('click', '#closePopup,.cancelBtn', function () {
            window.location.replace("/master/index.html#/dispatch");
        });
        $('.submitSearch').on('click', submitSeachFrom);
        $('#dispatchForm').on('change', '.qItemNoQuantity,.qItemPrice ,.check', function () {
            calculateSingleItem($(this).closest('.quotationItem'));
        });
        $('#dispatchForm').on('keyup', '.qItemNoQuantity,.qItemPrice ,.check', function () {
            calculateSingleItem($(this).closest('.quotationItem'));
        });
        $('#dispatchForm').on('change', '.qDiscount', calculateTotal);
        $('#dispatchForm').on('keyup', '.qDiscount', calculateTotal);
        $('#dispatchForm').on('keyup', '.qPayable', calculateTotal);
        $('#dispatchForm').on('click', '.saveBtn', saveFullchallan);
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

    async function submitSeachFrom() {
        let from = $('#fDate').val();
        let to = $('#tDate').val();
        let truck = $('#truck').find(":selected").val()
        let cnd = [];


        backendSource.getObject('dispatch', get_param1, { where: cnd }, function (data) {
            if (data.SUCCESS) {
                console.log(data.MESSAGE);
                showForm(data.MESSAGE)
            }
        })
    }
    function showForm(data) {
        console.log(data);
        let dOpt = `<option value="">Select Driver</option>`;
        let tOpt = `<option value="">Select truck</option>`;
        drivers.map((e) => {
            dOpt += `<option value="${e.id}" ${data && data.driver_id == e.id ? `selected` : ``}>${e.name}</option>`;
        });
        truckArray.map((e) => {
            tOpt += `<option value="${e.id}" ${data && data.truck_id == e.id ? `selected` : ``}>${e.name}(${e.number})</option>`;
        });
        $("#dispatchForm").html(`
            <div class="row">
            <div class="col-12 mt-1 text-center fw-semibold fs-5">Add/Edit Dispatch Price</div>
            <div class="col-2 mt-3 text-end">Challan Code</div>
            <div class="col-4 mt-3 input-container">
              <input type="text" class="qCode" disabled value="${data.code}"/>
            </div>
            <div class="col-2 mt-3 text-end">Truck</div>
            <div class="col-4 mt-3 input-container">
               <select  class="qTruck" readonly disabled>
                ${tOpt}
               </select>
            </div>
            <div class="col-2 mt-3 text-end">Driver</div>
            <div class="col-4 mt-3 input-container">
              <select  class="qDriver" disabled>${dOpt}</select>
            </div>

            <div class="col-2 mt-3 text-end">Challan Date</div>
            <div class="col-4 mt-3 input-container">
              <input type="date" class="qDate" disabled  value="${data ? moment(data.date).format('YYYY-MM-DD') : ''}"/>
            </div>
 

            <div class="col-2 mt-3 text-end">From</div>
            <div class="col-4 mt-3 input-container">
              <input type="text"  class="qFrom" disabled value="${data.from}"/>
            </div>
            <div class="col-2 mt-3 text-end"> To</div>
            <div class="col-4 mt-3 input-container">
              <input type="text"  class="qTo" disabled value="${data.to}"/>
            </div>

            
            <div class="col-2 mt-3 text-end">Description</div>
            <div class="col-4 mt-3 input-container">
              <textarea  class="qDescription">${data.description}</textarea>
            </div>
            
            <div class="col-6 mt-3"></div>
            
            <div class="col-12 my-3 qItemArea">
              <div class="row quotationItem head">
                <div class="col-2 input-container">Part Challan </div>
                <div class="col-3 input-container">Products</div>
                <div class="col-2 input-container">Quantity</div>
                <div class="col-2 input-container">Unit Price</div>
                <div class="col-2 input-container">Price </div>
              </div>
            </div>

            <div class="col-12 my-3">
              <div class="row quotationTotal head d-none">
                <div class="col-8 input-container text-end">Sub Total</div>
                <div class="col-3 input-container"><input type="number"  class="qSubTotal" value="${data ? data.total : ''}"/></div>
                <div class="col-1 input-container">&nbsp;</div>
                <div class="col-8 input-container text-end">Payment</div>
                <div class="col-3 input-container"><input type="number" class="qPayable" value="${data ? data.payable_amount : ''}"/></div>
                <div class="col-1 input-container">&nbsp;</div>
                <div class="col-8 input-container text-end">Due Amount </div>
                <div class="col-3 input-container"><input type="number"  class="qTotal" value="${data ? data.due : ''}"/></div>
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
            backendSource.getObject('dispatch_item', null, {
                where: [{ 'key': 'dispatch_id', 'operator': 'is', 'value': data.id }]
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
        let pOpt = `<option value="">Select Product</option>`;
        products.map((e) => {
            pOpt += `<option data-base_cost="${e.base_cost}" value="${e.id}" ${item && item.product_id == e.id ? `selected` : ``}>${e.name} (${e.weight}kg)</option>`;
        });
        $('.qItemArea').append(`<div class="row quotationItem item" data-itemid="${item ? item.id : ''}" data-partchallanid="${item ? item.part_challan_id : ''}">

        <div class="col-2 input-container">part Challan - ${item.part_challan_id}</div>

        <div class="col-3 input-container">
          <select  class="qItemProduct" disabled >${pOpt}</select>
        </div>
        <div class="col-2 input-container">
          <input type="number" class="qItemNoQuantity" disabled value="${item ? item.quantity : '1'}"/>
        </div>
        <div class="col-2 input-container">
          <input type="number" class="qItemPrice"  value="${item ? item.unit_price : '0'}"/>
        </div>
        <div class="col-2 input-container">
          <input type="number" readonly  class="qItemTotal"  value="${item ? item.total : ''}"/>
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
        $('#dispatchForm').find('.qItemTotal').each(function (i, obj) {
            if (parseFloat($(this).val()) > 0 && document.querySelectorAll(".check")[i].checked) {
                tot += parseFloat($(this).val());
            }
        });
        let pay = $('#dispatchForm').find('.qPayable').val();
        pay = parseFloat(pay) > 0 ? parseFloat(pay) : 0;
        $('#dispatchForm').find('.qSubTotal').val(tot);
        console.log(tot)
        $('#dispatchForm').find('.qTotal').val(tot - (pay));

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
        let truck_id = $('.qTruck').val();
        let truck = truckArray.find((t) => t.id == truck_id)
        let code = $('.qCode').val();
        let program_date_from = $('.qFrom').val();
        let program_date_to = $('.qTo').val();
        let subTotal = $('.qSubTotal').val();
        let driver_id = $('.qDriver').val() == '' ? truck && truck.driver_id : $('.qDriver').val()

        if (!truck_id || truck_id == '') {
            DM_TEMPLATE.showSystemNotification(0, `Select the truck.`);
            return;
        }
        if (!code || code == '') {
            DM_TEMPLATE.showSystemNotification(0, `Provide the invoie Code.`);
            return;
        }
        if (!subTotal || subTotal == '') {
            DM_TEMPLATE.showSystemNotification(0, `Invoice value can not zero.`);
            return;
        }
        DM_TEMPLATE.showBtnLoader(elq('.saveBtn'), true);
        backendSource.saveObject('dispatch', id && id.trim() != '' ? id : null, {
            truck_id: truck_id,
            driver_id: driver_id,
            code: code,
            from: program_date_from,
            to: program_date_to,
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
                $('#dispatchForm').find('.quotationItem.item').each(function (i, obj) {
                    let prod = $(this).find('.qItemProduct').val();
                    let qnt = $(this).find('.qItemNoQuantity').val();
                    let dispatch = $(this).find('.qItemDispatch').val();
                    let price = $(this).find('.qItemPrice').val();
                    let total = $(this).find('.qItemTotal').val();
                    let oId = $(this).attr('data-itemid');
                    let pId = $(this).attr('data-partchallanid');
                    if (prod && prod != '') {
                        let tItem = {
                            BACKEND_ACTION: 'update',
                            quantity: qnt && qnt != '' ? qnt : 1,
                            unit_price:price && price!=''?price:0,
                            total:total && total!=''?total:0,
                            dispatch_unit: dispatch && dispatch != '' ? dispatch : 0,
                            product_id: prod,
                            dispatch_id: data.MESSAGE,
                            part_challan_id: pId,
                            ID_RESPONSE: i
                        }
                        if (oId && oId != '') {
                            tItem['id'] = oId;
                        }
                        patchArr.push(tItem);
                    }
                    console.log(patchArr);
                });
                backendSource.patch('dispatch_item', patchArr, function (res) {
                    DM_TEMPLATE.showSystemNotification(1, `dispatch updated successfully.`);
                    setTimeout(function () {
                        window.location.replace("/master/index.html#/dispatch");
                    }, 1000);
                });
            } else {
                DM_TEMPLATE.showSystemNotification(0, `Unable to update. Please try again.`);
            }
            DM_TEMPLATE.showBtnLoader(elq('.saveBtn'), false);
        });
    }

})();