'use strict';

(function () {

    const popup = document.getElementById("sitePopup");
    let truckArray = [];
    let driverArray = [];
    let DATALIMIT = 15;
    let DATASTART = 0;
    init();

    async function init() {
        getDriver()
        getTruck();
        bindEvents();
    }

    function bindEvents() {
        $('#sitePopup').off('click');
        $('#sitePopup').on('click', '#closePopup', function () {
            popup.style.display = "none";
        });
        $('#sitePopup').on('click', '.saveBtn', saveTruck);
        $('.createTruck').on('click', truckPopup);
        $('.searchTruck').on('click', getTruck);
        $('#tblTruck').on('click', `[data-editid]`, truckPopup);
        $('#tblTruck').on('click', `[data-statusid]`, statusPopup);
        $('#sitePopup').on('click', '.statusSaveBtn', statusSave);
        $('.container').on('click', `.Next`, function () {
            console.log("working");
            DATASTART = DATASTART + DATALIMIT;
            getTruck()
        });
        $('.container').on('click', `.Previous`, function () {
            console.log("working");
            if (DATASTART > 0) {
                DATASTART = DATASTART - DATALIMIT;
                getTruck()
            }
        });
    }


    function truckPopup() {
        const uid = $(this).attr('data-editid');
        const truck = truckArray.find((e) => { return e.id == uid });
        let driver = '<option value="">Please select driver</option>';
        driverArray.map((d)=>{
            driver+=`<option ${truck&&truck.driver_id==d.id?'selected':''} value=${d.id}>${d.name}</option>`
        })
        $(`#sitePopup`).html(`<div class="popup-content" style="max-width:900px">
        <span class="close" id="closePopup">&times;</span>
        <h2>Truck</h2>
        <div class="container">
          <div class="row">
           <div class="col-4 mt-3">Name</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="tName" value="${truck ? truck.name : ''}"/>
               <input type="hidden" class="tId" value="${truck ? truck.id : ''}"/>
            </div>
    
            <div class="col-4 mt-3">Number</div>
            <div class="col-8 mt-3 input-container">
              <input type="text" class="tNumber" value="${truck ? truck.number : ''}"/>
            </div>
            <div class="col-4 mt-3">Driver Name</div>
            <div class="col-8 mt-3 input-container">
            <select class='form-select tdriver_id'>
            ${driver}
            </select>
            </div>
            <div class="col-4 mt-3">&nbsp;</div>
            <div class="col-8 mt-3"><span class="gameButton saveBtn"> Save </span></div>
          </div>
        </div>
      </div>`);

        popup.style.display = "block";
    }

    async function getTruck() {
        DM_TEMPLATE.showBtnLoader(elq('.searchUser'), true);
        let tName = $('#tName').val();
        let tNumber = $('#tNumber').val();
        let tStatus = $('#tStatus').find(":selected").val();
        let cnd = [];
        let lim = {
            start: DATASTART,
            end: DATASTART + DATALIMIT
        }
        if (tName && tName != '') {
            cnd.push({ 'key': 'name', 'operator': 'like', 'value': tName })
        }
        if (tNumber && tNumber != '') {
            cnd.push({ 'key': 'number', 'operator': 'like', 'value': tNumber })
        }
        if (tStatus && tStatus != '') {
            cnd.push({ 'key': 'status', 'operator': 'is', 'value': tStatus })
        }
        backendSource.getObject('truck', null, { 
            where: cnd, 
            limit: lim,
            order: {
                type: 'desc',
                by: 'id'
            },
         }, function (data) {
            if (data.SUCCESS) {
                truckArray = data.MESSAGE;
                console.log(truckArray);
                $('#tblTruck tbody').html('');
                if (data.MESSAGE.length > 0) {
                    data.MESSAGE.map((e) => {
                        $('#tblTruck tbody').append(`
              <tr>
                <td>${e.id}</td>
                <td>${e.name}</td>
                <td >${e.number}</td>
                <td >${e.driver_id}</td>
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
                    $('#tblTruck tbody').append(`
              <tr>
                <td colspan="9">No record found</td>
              </tr>
            `);
                }
            }
            DM_TEMPLATE.showBtnLoader(elq('.searchUser'), false);
        });
    }
    
    function getDriver() {
        let cnd=[];
        backendSource.getObject('driver', null, { where: cnd}, function (data) {
            if (data.SUCCESS) {
                driverArray = data.MESSAGE;
                console.log(driverArray);
            }
    })
    }

    async function saveTruck() {
        DM_TEMPLATE.showBtnLoader(elq('.saveBtn'), true);
        let id = $('.tId').val();

        backendSource.saveObject('truck', id && id.trim() != '' ? id : null, {
            name: $('.tName').val(),
            number: $('.tNumber').val(),
            driver_id:parseInt( $('.tdriver_id').val()),
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
        const truck = truckArray.find((e) => { return e.id == uid });
        $(`#sitePopup`).html(`<div class="popup-content">
        <span class="close" id="closePopup">&times;</span>
        <h2>Change status</h2>
        <div class="container">
          <div class="row">
            <div class="col-4 mt-3">Name</div>
            <div class="col-8 mt-3 input-container">${truck ? truck.name : ''}</div>
            <div class="col-4 mt-3">Number</div>
            <div class="col-8 mt-3 input-container">${truck ? truck.number : ''}</div>
            <div class="col-4 mt-3">Status</div>
            <div class="col-8 mt-3 input-container">
            <select type="text" class="cStatus">
              <option ${truck && truck.status == 1 ? 'selected' : ''} value="1">Enable</option>
              <option ${truck && truck.status != 1 ? 'selected' : ''} value="2">Disable</option>
            </select>
            <input type="hidden" class="tId" value="${truck ? truck.id : ''}"/>
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
        let id = $('.tId').val();

        if (id && id.trim() != '') {

            backendSource.saveObject('truck', id, {
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