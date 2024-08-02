'use strict';

(function () {

    const popup = document.getElementById("sitePopup");
    let vendorarray = [];
    let DATALIMIT=15;
    let DATASTART = 0;
    init();

    async function init() {
        getVendor();
        bindEvents();
    }

    function bindEvents() {
        $('#sitePopup').off('click');
        $('#sitePopup').on('click', '#closePopup', function () {
            popup.style.display = "none";
        });
        $('#sitePopup').on('click', '.saveBtn', saveVendor);
        $('.createVendor').on('click', vendorPopup);
        $('.searchVendor').on('click', getVendor);
        $('#tblVendor').on('click', `[data-editid]`, vendorPopup);
        $('#tblVendor').on('click', `[data-deleteid]`, deleteVendor);
        $('#tblVendor').on('click', `[data-statusid]`, statusPopup);
        $('#sitePopup').on('click', '.statusSaveBtn', statusSave);
        $('.container').on('click', `.Next`, function(){
            console.log("working");
            DATASTART = DATASTART+DATALIMIT;
            getVendor()
        });
    }


    function vendorPopup() {
        const uid = $(this).attr('data-editid');
        const vendor = vendorarray.find((e) => { return e.id == uid });

        $(`#sitePopup`).html(`<div class="popup-content" style="max-width:900px">
        <span class="close" id="closePopup">&times;</span>
        <h2>Vendor</h2>
        <div class="container">
          <div class="row">
           <div class="col-4 mt-3">Name</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="uName" value="${vendor ? vendor.name : ''}"/>
            </div>
            <div class="col-4 mt-3">Company Name</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="uCompany" value="${vendor ? vendor.company : ''}"/>
              <input type="hidden" class="uId" value="${vendor ? vendor.id : ''}"/>
            </div>
            <div class="col-4 mt-3">Phone</div>
            <div class="col-8 mt-3 input-container">
            <input type="text" class="uPh" value="${vendor ? vendor.ph : ''}"/>
            </div>
            <div class="col-4 mt-3">Email</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="uEmail" value="${vendor ? vendor.email : ''}"/>
            </div>
            <div class="col-4 mt-3">Address</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="uAddress" value="${vendor ? vendor.address : ''}"/>
            </div>
            <div class="col-4 mt-3">Bank Name</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="bank_name" value="${vendor ? vendor.bank_name : ''}"/>
            </div>
            <div class="col-4 mt-3">Holder Name</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="holder_name" value="${vendor ? vendor.holder_name : ''}"/>
            </div>
            <div class="col-4 mt-3">Account Number</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="acc_no" value="${vendor ? vendor.acc_no : ''}"/>
            </div>
            <div class="col-4 mt-3">Branch</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="branch" value="${vendor ? vendor.branch : ''}"/>
            </div>
            <div class="col-4 mt-3">IFSC Code</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="ifsc" value="${vendor ? vendor.ifsc : ''}"/>
            </div>
            
            
            <div class="col-4 mt-3">&nbsp;</div>
            <div class="col-8 mt-3"><span class="gameButton saveBtn"> Save </span></div>
          </div>
        </div>
      </div>`);

        popup.style.display = "block";
    }

    async function getVendor() {
        DM_TEMPLATE.showBtnLoader(elq('.searchUser'), true);
        let uEmail = $('#uEmail').val();
        let uName = $('#uName').val();
        let uPh = $('#uPhone').val();
        let uStatus = $('#uStatus').find(":selected").val();
        let cnd = [];
        let lim={
            start:DATASTART,
            end:DATASTART+DATALIMIT
        }
        if (uEmail && uEmail != '') {
            cnd.push({ 'key': 'email', 'operator': 'like', 'value': uEmail })
        }
        if (uName && uName != '') {
            cnd.push({ 'key': 'name', 'operator': 'like', 'value': uName })
        }
        if (uPh && uPh != '') {
            cnd.push({ 'key': 'ph', 'operator': 'like', 'value': uPh })
        }
        if (uStatus && uStatus != '') {
            cnd.push({ 'key': 'status', 'operator': 'is', 'value': uStatus })
        }
      backendSource.getObject('vendor', null, {
        where: cnd,
        limit: lim,
        order: {
          type: 'desc',
          by: 'id'
        }, }, function (data) {
            if (data.SUCCESS) {
                vendorarray = data.MESSAGE;
                console.log(vendorarray);
                $('#tblVendor tbody').html('');
                if (data.MESSAGE.length > 0) {
                    data.MESSAGE.map((e) => {
                        $('#tblVendor tbody').append(`
              <tr>
                <td>${e.id}</td>
                <td>${e.name}</td>
                <td >${e.email}</td>
                <td >${e.ph}</td>
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
                    $('#tblVendor tbody').append(`
              <tr>
                <td colspan="9">No record found</td>
              </tr>
            `);
                }
            }
            DM_TEMPLATE.showBtnLoader(elq('.searchUser'), false);
        });
    }
   

    async function saveVendor() {
        DM_TEMPLATE.showBtnLoader(elq('.saveBtn'), true);
        let id = $('.uId').val();

        backendSource.saveObject('vendor', id && id.trim() != '' ? id : null, {
            name: $('.uName').val(),
            ph: $('.uPh').val(),
            email: $('.uEmail').val(),
            company: $('.uCompany').val(),
            address: $('.uAddress').val(),
            bank_name: $('.bank_name').val(),
            acc_no: $('.acc_no').val(),
            branch: $('.branch').val(),
            ifsc: $('.ifsc').val(),
            holder_name: $('.holder_name').val()
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
  function deleteVendor() {
    const uid = $(this).attr('data-deleteid');
    if (confirm("You want to delete Vendor!") == false) {
      return;
    }
    backendSource.deleteObject('vendor', uid, function (data) {
      if (data.SUCCESS) {
        DM_TEMPLATE.showSystemNotification(1, `vendor delete successfully.`);
        popup.style.display = "none";
        setTimeout(function () {
          window.location.reload();
        }, 1000);
      } else {
        DM_TEMPLATE.showSystemNotification(0, `Unable to delete. Please try again.`);
      }
    })
  }
  function statusPopup() {
    const uid = $(this).attr('data-statusid');
    const vendor = vendorarray.find((e) => { return e.id == uid });
    $(`#sitePopup`).html(`<div class="popup-content">
        <span class="close" id="closePopup">&times;</span>
        <h2>Change status</h2>
        <div class="container">
          <div class="row">
            <div class="col-4 mt-3">Name</div>
            <div class="col-8 mt-3 input-container">${vendor ? vendor.name : ''}</div>
            <div class="col-4 mt-3">Phone Number</div>
            <div class="col-8 mt-3 input-container">${vendor ? vendor.ph : ''}</div>
            <div class="col-4 mt-3">Status</div>
            <div class="col-8 mt-3 input-container">
            <select type="text" class="cStatus">
              <option ${vendor && vendor.status == 1 ? 'selected' : ''} value="1">Enable</option>
              <option ${vendor && vendor.status != 1 ? 'selected' : ''} value="2">Disable</option>
            </select>
            <input type="hidden" class="vId" value="${vendor ? vendor.id : ''}"/>
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
    let id = $('.vId').val();

    if (id && id.trim() != '') {

      backendSource.saveObject('vendor', id, {
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
