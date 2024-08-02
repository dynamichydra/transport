'use strict';

(function () {

    const popup = document.getElementById("sitePopup");
    let productArray = [];
    let DATALIMIT = 15;
    let DATASTART = 0;
    init();

    async function init() {
        getProduct();
        bindEvents();
    }

    function bindEvents() {
        $('#sitePopup').off('click');
        $('#sitePopup').on('click', '#closePopup', function () {
            popup.style.display = "none";
        });
        $('#sitePopup').on('click', '.saveBtn', saveProduct);
        $('.createProduct').on('click', ProductPopup);
        $('.searchProduct').on('click', getProduct);
        $('#tblProduct').on('click', `[data-editid]`, ProductPopup);
        $('#tblProduct').on('click', `[data-statusid]`, statusPopup);
        $('#tblProduct').on('click', `[data-deleteid]`, deleteProduct);
        $('#sitePopup').on('click', '.statusSaveBtn', statusSave);
        $('.container').on('click', `.Next`, function () {
            console.log("working");
            DATASTART = DATASTART + DATALIMIT;
            getProduct()
        });
        $('.container').on('click', `.Previous`, function () {
            console.log("working");
            if (DATASTART > 0) {
                DATASTART = DATASTART - DATALIMIT;
                getProduct()
            }
        });
    }


    function ProductPopup() {
        const uid = $(this).attr('data-editid');
        const product = productArray.find((e) => { return e.id == uid });

        $(`#sitePopup`).html(`<div class="popup-content" style="max-width:900px">
        <span class="close" id="closePopup">&times;</span>
        <h2>Product</h2>
        <div class="container">
          <div class="row">
           <div class="col-4 mt-3">Name</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="pName" value="${product ? product.name : ''}"/>
               <input type="hidden" class="pId" value="${product ? product.id : ''}"/>
            </div>
            <div class="col-4 mt-3">Weight</div>
            <div class="col-8 mt-3 input-container">
            <input type="number" class="pWeight" value="${product ? product.weight : ''}"/>
            </div>
            <div class="col-4 mt-3">Unit</div>
            <div class="col-8 mt-3 input-container">
            <input type="text" class="pUnit" value="${product ? product.unit : ''}"/>
            </div>
            <div class="col-4 mt-3">Code</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="pCode" value="${product ? product.code : ''}"/>
            </div>
            <div class="col-4 mt-3">Description</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="pDescription" value="${product ? product.description : ''}"/>
            </div>
            
            
            <div class="col-4 mt-3">&nbsp;</div>
            <div class="col-8 mt-3"><span class="gameButton saveBtn"> Save </span></div>
          </div>
        </div>
      </div>`);

        popup.style.display = "block";
    }

    async function getProduct() {
        DM_TEMPLATE.showBtnLoader(elq('.searchUser'), true);
        let pName = $('#pName').val();
        let pStatus = $('#pStatus').find(":selected").val();
        let cnd = [];
        let lim = {
            start: DATASTART,
            end: DATASTART + DATALIMIT
        }
      
        if (pName && pName != '') {
            cnd.push({ 'key': 'name', 'operator': 'like', 'value': pName })
        }
        if (pStatus && pStatus != '') {
            cnd.push({ 'key': 'status', 'operator': 'is', 'value': pStatus })
        }
        backendSource.getObject('product', null, {
            where: cnd, 
            limit: lim, 
            order: {
                type: 'desc',
                by: 'id'
            }, }, function (data) {
            if (data.SUCCESS) {
                productArray = data.MESSAGE;
                console.log(productArray);
                $('#tblProduct tbody').html('');
                if (data.MESSAGE.length > 0) {
                    data.MESSAGE.map((e) => {
                        $('#tblProduct tbody').append(`
              <tr>
                <td>${e.id}</td>
                <td>${e.code}</td>
                <td>${e.name}</td>
                <td>${e.unit}</td>
                <td >${e.weight}</td>
                <td class="${e.status == 1 ? 'enable' : 'disable'}">${e.status == 1 ? 'Enable' : 'Disable'}</td>
                <td>
                 <div style="display:flex; justify-content:start">
                 <span class="actionBtn" data-editid="${e.id}"><i class="bi bi-pencil-square"></i></span>
                  <span class="actionBtn" data-deleteid="${e.id}"><i class="bi bi-trash"></i></span>
                    <span class="actionBtn" data-statusid="${e.id}"><i class="bi ${e.status == 1 ? 'bi-lock' : 'bi-unlock'}"></i></span>
                 </div>
                </td>
              </tr>
            `);
                    });
                } else {
                    $('#tblProduct tbody').append(`
              <tr>
                <td colspan="9">No record found</td>
              </tr>
            `);
                }
            }
            DM_TEMPLATE.showBtnLoader(elq('.searchUser'), false);
        });
    }


    async function saveProduct() {
        DM_TEMPLATE.showBtnLoader(elq('.saveBtn'), true);
        let id = $('.pId').val();

        backendSource.saveObject('product', id && id.trim() != '' ? id : null, {
            name: $('.pName').val(),
            weight: $('.pWeight').val(),
            unit: $('.pUnit').val(),
            code: $('.pCode').val(),
            description: $('.pDescription').val(),
        }, function (data) {
            if (data.SUCCESS) {
                DM_TEMPLATE.showSystemNotification(1, `Profile updated successfully.`);
                popup.style.display = "none";
                window.location.reload();
            } else {
                DM_TEMPLATE.showSystemNotification(0, `Unable to update. Please try again.`);
            }
            DM_TEMPLATE.showBtnLoader(elq('.saveBtn'), false);
        });
    }
    function statusPopup() {
        const uid = $(this).attr('data-statusid');
        const product = productArray.find((e) => { return e.id == uid });
        $(`#sitePopup`).html(`<div class="popup-content">
        <span class="close" id="closePopup">&times;</span>
        <h2>Change status</h2>
        <div class="container">
          <div class="row">
            <div class="col-4 mt-3">Name</div>
            <div class="col-8 mt-3 input-container">${product ? product.name : ''}</div>
            <div class="col-4 mt-3">Status</div>
            <div class="col-8 mt-3 input-container">
            <select type="text" class="cStatus">
              <option ${product && product.status == 1 ? 'selected' : ''} value="1">Enable</option>
              <option ${product && product.status != 1 ? 'selected' : ''} value="2">Disable</option>
            </select>
            <input type="hidden" class="pId" value="${product ? product.id : ''}"/>
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
        let id = $('.pId').val();

        if (id && id.trim() != '') {

            backendSource.saveObject('product', id, {
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

    function deleteProduct() {
        const uid = $(this).attr('data-deleteid');
        if (confirm("You want to delete Product!") == false) {
            return;
        }
        backendSource.deleteObject('product', uid, function (data) {
            if (data.SUCCESS) {
                DM_TEMPLATE.showSystemNotification(1, `Product delete successfully.`);
                popup.style.display = "none";
                setTimeout(function () {
                    window.location.reload();
                }, 1000);
            } else {
                DM_TEMPLATE.showSystemNotification(0, `Unable to delete. Please try again.`);
            }
        })
    }
})();