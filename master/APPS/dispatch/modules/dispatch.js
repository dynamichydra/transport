'use strict';

(function () {

    const popup = document.getElementById("sitePopup");
    let fullChallan = [];
    let DATALIMIT = 15;
    let DATASTART = 0;
    init();

    async function init() {
        $('#iDfrom').val(moment(new Date()).format('YYYY-01-01'));
        $('#iDto').val(moment(new Date()).format('YYYY-12-31'));
        getInvoice();
        bindEvents();
    }

    function bindEvents() {
        $('#sitePopup').off('click');
        $('#sitePopup').on('click', '#closePopup,.cancelBtn', function () {
            popup.style.display = "none";
        });
        $('.searchQuotation').on('click', getInvoice);
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
            cnd.push({ 'key': 'full_challan##status', 'operator': 'is', 'value': iStatus })
        }
        backendSource.getObject('dispatch', null, {
            where: cnd,
            limit: lim,
            order: {
                type: 'desc',
                by: 'id'
            },
            reference: [{ obj: 'driver', a: 'id', b: 'driver_id' }, { obj: 'truck', a: 'id', b: 'truck_id' }],
            select: "dispatch.*, driver.name dName, truck.name tName"
        }, function (data) {
            if (data.SUCCESS) {
                fullChallan = data.MESSAGE;
                console.log(fullChallan);
                $('#tblInvoice tbody').html('');
                if (data.MESSAGE.length > 0) {
                    data.MESSAGE.map((e) => {
                        $('#tblInvoice tbody').append(`
              <tr>
                <td>${e.id}</td>
                <td>${e.code}</td>
                <td>${e.dName}</td>
                <td>${e.tName}</td>
                <td >${moment(e.date).format('DD-MM-YYYY')}</td>
                <td >${e.from}</td>
                <td >${e.to}</td>
                <td>
                <div style="display:flex;justify-content:start">
                    <span class="actionBtn" data-printid="${e.id}"><i class="bi bi-printer"></i></span>
                    <span class="actionBtn"> <a href="/master/index.html#/dispatch/editdispatch/${e.id}"><i class="bi bi-cash-stack"></i></a></span>
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

    function statusPopup() {
        const uid = $(this).attr('data-statusid');
        const invoice = fullChallan.find((e) => { return e.id == uid });
        $(`#sitePopup`).html(`<div class="popup-content">
        <span class="close" id="closePopup">&times;</span>
        <h2>Change status</h2>
        <div class="container">
          <div class="row">
            <div class="col-4 mt-3">Invoice</div>
            <div class="col-8 mt-3 input-container">${invoice ? invoice.code : ''} / ${invoice ? moment(invoice.i_date).format('DD-MM-YYYY') : ''}</div>
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
        let invoice = fullChallan.find((i) => i.id == id);
        console.log(invoice);
        if (id && id.trim() != '') {

            backendSource.saveObject('full_challan', id, {
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
