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
        $('#full_challan_form').on('click', '#closePopup,.cancelBtn', function () {
            window.location.replace("/master/index.html#/full_challan");
        });
        $('.submitSearch').on('click', submitSeachFrom);
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

    async function submitSeachFrom() {
        let from = $('#fDate').val();
        let to = $('#tDate').val();
        let truck = $('#truck').find(":selected").val()
        let cnd = [];
        

        backendSource.getObject('full_challan', get_param1, { where: cnd }, function (data) {
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
        $("#full_challan_form").html(`
            <div class="row">
            <div class="col-12 mt-1 text-center fw-semibold fs-5">Edit Full Challan</div>
            <div class="col-2 mt-3 text-end">Challan Code</div>
            <div class="col-4 mt-3 input-container">
              <input type="text" class="qCode"  value="${data.code}"/>
            </div>
            <div class="col-2 mt-3 text-end">Truck</div>
            <div class="col-4 mt-3 input-container">
               <select  class="qTruck" readonly>
                ${tOpt}
               </select>
            </div>
            <div class="col-2 mt-3 text-end">Driver</div>
            <div class="col-4 mt-3 input-container">
              <select  class="qDriver">${dOpt}</select>
            </div>

            <div class="col-2 mt-3 text-end">Challan Date</div>
            <div class="col-4 mt-3 input-container">
              <input type="date" class="qDate"  value="${data ? moment(data.date).format('YYYY-MM-DD') : ''}"/>
            </div>
 

            <div class="col-2 mt-3 text-end">From</div>
            <div class="col-4 mt-3 input-container">
              <input type="text"  class="qFrom" value="${data.from}"/>
            </div>
            <div class="col-2 mt-3 text-end"> To</div>
            <div class="col-4 mt-3 input-container">
              <input type="text"  class="qTo" value="${data.to}"/>
            </div>

            
            <div class="col-2 mt-3 text-end">Description</div>
            <div class="col-4 mt-3 input-container">
              <textarea  class="qDescription">${data.description}</textarea>
            </div>
            
            <div class="col-6 mt-3"></div>
            
            <div class="col-12 my-3 qItemArea">
              <div class="row quotationItem head">
                <div class="col-1 input-container"></div>
                <div class="col-2 input-container">Part Challan </div>
                <div class="col-3 input-container">Products</div>
                <div class="col-2 input-container">Quantity</div>
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
                backendSource.getObject('full_challan_item', null, {
                    where: [{ 'key': 'full_challan_id', 'operator': 'is', 'value': data.id }]
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
        <div class="col-1">
          <input class="form-check-input check" type="checkbox" checked value="" id="check">
        </div>

        <div class="col-2 input-container">Part Challan - ${item.part_challan_id}</div>

        <div class="col-3 input-container">
          <select  class="qItemProduct">${pOpt}</select>
        </div>
        <div class="col-2 input-container">
          <input type="number" class="qItemNoQuantity"  value="${item ? item.quantity : '1'}"/>
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

    async function saveFullchallan() {
        let id = $('.uId').val();
        let truck_id = $('.qTruck').val();
        let code = $('.qCode').val();
        let program_date_from = $('.qFrom').val();
        let program_date_to = $('.qTo').val();
        let driver_id = $('.qDriver').val();

        if (!truck_id || truck_id == '') {
            DM_TEMPLATE.showSystemNotification(0, `Select the truck.`);
            return;
        }
        if (!driver_id || driver_id == '') {
            DM_TEMPLATE.showSystemNotification(0, `Select the driver.`);
            return;
        }
        if (!code || code == '') {
            DM_TEMPLATE.showSystemNotification(0, `Provide the invoie Code.`);
            return;
        }

        DM_TEMPLATE.showBtnLoader(elq('.saveBtn'), true);
        backendSource.saveObject('full_challan', id && id.trim() != '' ? id : null, {
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
                $('#full_challan_form').find('.quotationItem.item').each(function (i, obj) {
                    let prod = $(this).find('.qItemProduct').val();
                    let qnt = $(this).find('.qItemNoQuantity').val();
                    let price = $(this).find('.qItemPrice').val();
                    let total = $(this).find('.qItemTotal').val();
                    let oId = $(this).attr('data-itemid');
                    let pId = $(this).attr('data-partchallanid');
                    let check = $(this).find(".check").is(":checked");
                    if (prod && prod != '' && check) {
                        let tItem = {
                            BACKEND_ACTION: 'update',
                            quantity: qnt && qnt != '' ? qnt : 1,
                            product_id: prod,
                            full_challan_id: data.MESSAGE,
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
                backendSource.patch('full_challan_item', patchArr, function (res) {
                    DM_TEMPLATE.showSystemNotification(1, `full Challan updated successfully.`);
                    setTimeout(function () {
                        window.location.replace("/master/index.html#/full_challan");
                    }, 1000);
                });
            } else {
                DM_TEMPLATE.showSystemNotification(0, `Unable to update. Please try again.`);
            }
            DM_TEMPLATE.showBtnLoader(elq('.saveBtn'), false);
        });
    }

})();