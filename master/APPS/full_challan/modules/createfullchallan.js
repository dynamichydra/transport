'use strict';

(function () {
    let products = [];
    let drivers = [];
    let partChallan=[];
    let truckArray=[];
    let removeItems = [];
    init();

    async function init() {
        getDriver();
        getProducts();
        getTruck();
        bindEvents();
    }

    function bindEvents() {
        $('#fDate').val(moment(new Date()).subtract(1, 'months').endOf('month').format('YYYY-MM-01'));
        $('#tDate').val(moment(new Date()).format('YYYY-MM-01'));
        $('#full_challan_form').on('click', '#closePopup,.cancelBtn', function () {
            window.location.replace("/master/index.html#/full_challan");
        });
        $('.submitSearch').on('click',submitSeachFrom);
        $('#full_challan_form').on('click', '.saveBtn', saveFullchallan);
    }
    
    function getTruck() {
        let cnd = [{ 'key': 'status', 'operator': 'is', 'value': 1 }];
        backendSource.getObject('truck', null, { where: cnd }, function (data) {
            if (data.SUCCESS) {
                if (data.MESSAGE.length > 0) {
                   truckArray= data.MESSAGE;
                    $('#truck').html('');
                   let html='<option value="">Select truck</option>'
                   truckArray.forEach((t)=>{
                       html +=`<option value="${t.id}">${t.name}(${t.number})</option>`
                   });
                    $('#truck').html(html);
                }
            }
        });
    }

    async function submitSeachFrom(){
       let from = $('#fDate').val();
       let to = $('#tDate').val();
      
       let cnd=[];
        if (!from || from == '') {
            DM_TEMPLATE.showSystemNotification(0, `Select From Date.`);
            return;
        }      
        if (!to || to == '') {
            DM_TEMPLATE.showSystemNotification(0, `Select To Date.`);
            return;
        }      
 
        if (from && from != '') {
            cnd.push({ 'key': 'date', 'operator': 'higher-equal', 'value': from + ' 00:00:00' });
        }
        if (to && to != '') {
            cnd.push({ 'key': 'date', 'operator': 'lower-equal', 'value': to + ' 23:59:59' });
        }
   
        
        backendSource.getObject('part_challan', null, { where: cnd }, function (data) {
            if (data.SUCCESS) {
                if (data.MESSAGE.length > 0) {
                    partChallan = data.MESSAGE;
                    console.log(partChallan);
                    showForm()
                }else{
                    $("#full_challan_form").html(`<div class="text-center fw-bold fs-3">Sorry No part challan found</div>`)
                }
            }
        })
    }
    function showForm(){
        let dOpt = `<option value="">Select Driver</option>`;
        let tOpt = `<option value="">Select truck</option>`;
        drivers.map((e) => {
            dOpt += `<option value="${e.id}" >${e.name}</option>`;
        });
        truckArray.map((e) => {
            tOpt += `<option value="${e.id}" >${e.name}(${e.number})</option>`;
        });
        $("#full_challan_form").html(`
            <div class="row">
            <div class="col-2 mt-3 text-end">Challan Code</div>
            <div class="col-4 mt-3 input-container">
              <input type="text" class="qCode"  value=""/>
            </div>
            <div class="col-2 mt-3 text-end">Truck</div>
            <div class="col-4 mt-3 input-container">
               <select  class="qTruck" >
               ${tOpt}
               </select>
            </div>
            <div class="col-2 mt-3 text-end">Driver</div>
            <div class="col-4 mt-3 input-container">
              <select  class="qDriver">${dOpt}</select>
            </div>

            <div class="col-2 mt-3 text-end">Challan Date</div>
            <div class="col-4 mt-3 input-container">
              <input type="date" class="qDate"  value=""/>
            </div>
 

            <div class="col-2 mt-3 text-end">From</div>
            <div class="col-4 mt-3 input-container">
              <input type="text"  class="qFrom" value=""/>
            </div>
            <div class="col-2 mt-3 text-end"> To</div>
            <div class="col-4 mt-3 input-container">
              <input type="text"  class="qTo" value=""/>
            </div>

            
            <div class="col-2 mt-3 text-end">Description</div>
            <div class="col-4 mt-3 input-container">
              <textarea  class="qDescription"></textarea>
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
              <input type="hidden" class="uId" value=""/>
            </div>
          </div>
        </div>
        </div>`);
        if (partChallan.length > 0) {
            partChallan.forEach((p) => {
                backendSource.getObject('part_challan_item', null, {
                    where: [{ 'key': 'part_challan_id', 'operator': 'is', 'value': p.id }]
                }, function (data) {
                    if (data.SUCCESS) {
                        for (let i in data.MESSAGE) {
                            addQuotationItem(data.MESSAGE[i],p.id);
                        }
                    }
                })
            })
        } else {
            addQuotationItem();
        }

    }
    function addQuotationItem(item,partChallanId) {
        console.log(item)
        let pOpt = `<option value="">Select Product</option>`;
        products.map((e) => {
            pOpt += `<option data-base_cost="${e.base_cost}" value="${e.id}" ${item && item.product_id == e.id ? `selected` : ``}>${e.name} (${e.weight}kg)</option>`;
        });
        $('.qItemArea').append(`
            <div class="row quotationItem item" data-itemid="" data-partchallanid="${partChallanId ? partChallanId:''}">
        <div class="col-1">
          <input class="form-check-input check" type="checkbox" checked value="" id="check">
        </div>
        
        <div class="col-2 input-container">Part Challan - ${partChallanId}</div>
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
        let from = $('.qFrom').val();
        let to = $('.qTo').val();
        let driver_id = $('.qDriver').val();
        let date = $('.qDate').val()

        if (!truck_id || truck_id == '') {
            DM_TEMPLATE.showSystemNotification(0, `Select the truck.`);
            return;
        }
        if (!date || date == '') {
            DM_TEMPLATE.showSystemNotification(0, `Select the date.`);
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
            from: from,
            to: to,
            date: date,
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
                    let oId = $(this).attr('data-itemid');
                    let pId = $(this).attr('data-partchallanid');
                    let check = $(this).find(".check").is(":checked");
                    console.log(check);
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