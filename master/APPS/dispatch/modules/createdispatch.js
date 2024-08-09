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
            window.location.replace("/master/index.html#/full_challan");
        });
        $('.submitSearch').on('click', submitSeachFrom);
        $('#dispatchForm').on('change', '.qItemDispatch,.qItemPrice , .check', function () {
            calculateSingleItem($(this).closest('.quotationItem'));
        });
        $('#dispatchForm').on('keyup', '.qItemDispatch,.qItemPrice, .check', function () {
            calculateSingleItem($(this).closest('.quotationItem'));
        });
        $('#dispatchForm').on('change', '.qDiscount', calculateTotal);
        $('#dispatchForm').on('keyup', '.qDiscount', calculateTotal);
        $('#dispatchForm').on('keyup', '.qPayable', calculateTotal);
        $('#dispatchForm').on('click', '.saveBtn', saveFullchallan);
        $('#dispatchForm').on('click', '.dispatchBtn', dispatchProduct);
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
        $("#dispatchForm").html(`
            <div class="row">
             <div class="col-12 mt-1 text-center fw-semibold fs-5">Create Dispatch</div>
            <div class="col-2 mt-3 text-end">Dispatch Code</div>
            <div class="col-4 mt-3 input-container">
              <input type="text" class="qCode"  value=""/>
            </div>
            <div class="col-2 mt-3 text-end">Truck</div>
            <div class="col-4 mt-3 input-container">
               <select  class="qTruck" disabled>
                ${tOpt}
               </select>
            </div>
            <div class="col-2 mt-3 text-end">Driver</div>
            <div class="col-4 mt-3 input-container">
              <select  class="qDriver" disabled>${dOpt}</select>
            </div>

            <div class="col-2 mt-3 text-end">Date</div>
            <div class="col-4 mt-3 input-container">
              <input type="date" class="qDate"  value=""/>
            </div>
 

            <div class="col-2 mt-3 text-end">From</div>
            <div class="col-4 mt-3 input-container">
              <input type="text"  class="qFrom" value="${data.from}"/>
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
                <div class="col-1 input-container"> </div>
                <div class="col-2 input-container">Part Challan </div>
                <div class="col-2 input-container">Products</div>
                <div class="col-2 input-container">Quantity</div>
                <div class="col-2 input-container">Dispatch Unit</div>
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
        $('.qItemArea').append(item.quantity - item.dispatch_unit==0?'':`<div class="row quotationItem item" data-itemid="${''}" data-partchallanid="${item ? item.part_challan_id : ''}">
        <div class="col-1"><input class="form-check-input check" type="checkbox" checked value="" id="flexCheckDefault"></div>
        <div class="col-2 input-container">Part Challan - ${item.part_challan_id}</div>

        <div class="col-2 input-container">
          <select  class="qItemProduct" disabled>${pOpt}</select>
        </div>
        <div class="col-2 input-container">
          <input type="number" class="qItemNoQuantity" disabled  value="${item ? item.quantity-item.dispatch_unit : '1'}"/>
        </div>
        <div class="col-2 input-container">
          <input type="number" class="qItemDispatch" max="${item.quantity}"  value=""/>
          <input type="hidden" class="full_challan_item" value="${item ? item.id : ''}"/>
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
        $('#dispatchForm').find('.qTotal').val(tot - (pay));
    }

    function calculateSingleItem(cntr) {
        console.log(cntr);
            let qnt = parseFloat($(cntr).find('.qItemNoQuantity').val());
            let dispatchUnit = parseFloat($(cntr).find('.qItemDispatch').val());
            let price = parseFloat($(cntr).find('.qItemPrice').val());
            if ($(cntr).find('.qItemProduct').val() == '') price = 0;
             console.log(dispatchUnit * price);
            $(cntr).find('.qItemTotal').val((dispatchUnit * price));
            // calculateTotal();
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
        if (!code || code == '') {
            DM_TEMPLATE.showSystemNotification(0, `Provide the invoie Code.`);
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
                let fItemArr=[];
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
                    let oId = $(this).attr('data-itemid');
                    let fcId = $(this).find('.full_challan_item').val();
                    let pId = $(this).attr('data-partchallanid');
                    let check = $(this).find(".check").is(":checked");
                    if (prod && prod != '' && check) {
                        let tItem = {
                            BACKEND_ACTION: 'update',
                            quantity: qnt && qnt != '' ? qnt : 1,
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
                        fItemArr.push({...tItem,id:fcId});
                    }
                    console.log(patchArr, fItemArr);
                });
                backendSource.patch('dispatch_item', patchArr, function (res) {
                    backendSource.patch('full_challan_item',fItemArr,function(res){;
                    DM_TEMPLATE.showSystemNotification(1, `full Challan updated successfully.`);
                    setTimeout(function () {
                        window.location.replace("/master/index.html#/full_challan");
                    }, 1000);
                    })
                });
            } else {
                DM_TEMPLATE.showSystemNotification(0, `Unable to update. Please try again.`);
            }
            DM_TEMPLATE.showBtnLoader(elq('.saveBtn'), false);
        });
    }
     
//     function dispatchProduct(params) {
//         let productId = $(this).attr('data-product');
//         let challanId = $(this).attr('data-partchallan');
//         let quentity = $(this).attr('data-quantity');
//         let pOpt = `<option value="">Select Product</option>`;
//         products.map((e) => {
//             pOpt += `<option  value="${e.id}" ${productId == e.id ? `selected` : ``}>${e.name} (${e.weight}kg)</option>`;
//         });
//         console.log(productId,challanId,quentity);
//         $('.dItemArea').html('')
//         $('.dItemArea').append(`<div class="row quotationItem item"  data-partchallanid="${challanId}">

//         <div class="col-2 input-container">part Challan - ${challanId}</div>

//         <div class="col-2 input-container">
//           <select  class="qItemProduct">${pOpt}</select>
//         </div>
//         <div class="col-2 input-container">
//           <input type="number" class="qItemNoQuantity"  value="${quentity}"/>
//         </div>
//         <div class="col-2 input-container">
//           <input type="number" class="qDispatch"  value=""/>
//         </div>
//         <div class="col-2 input-container">
//           <input type="number" class="qDispatch"  value=""/>
//         </div>
//         <div class="col-2 input-container">
//           <input type="number" class="qDispatch"  value=""/>
//         </div>
//       </div>`)
//         $('#dispatch').modal('show');
//    }


})();