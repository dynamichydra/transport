'use strict';

(function () {

    const popup = document.getElementById("sitePopup");
    let productArray = [];
    let vendor = []
    let DATALIMIT = 15;
    let DATASTART = 0;
    let payment = [];
    init();

    async function init() {
        getvendor();
        bindEvents();
    }

    function bindEvents() {
        $('#fDate').val(moment(new Date()).subtract(1, 'months').endOf('month').format('YYYY-MM-01'));
        $('#tDate').val(moment(new Date()).format('YYYY-MM-01'));
        $('#sitePopup').off('click');
        $('#sitePopup').on('click', '#closePopup', function () {
            popup.style.display = "none";
        });
        $('.submitSearch').on('click', submitSeachFrom);
    }

    async function getReport() {
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
            },
        }, function (data) {
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

    function getvendor() {
        let cnd = [{ 'key': 'status', 'operator': 'is', 'value': 1 }];
        backendSource.getObject('vendor', null, { where: cnd }, function (data) {
            if (data.SUCCESS) {
                $('#iClient').html('<option value="">Select vendor</option>');
                if (data.MESSAGE.length > 0) {
                    vendor = data.MESSAGE;
                    data.MESSAGE.map((e) => {
                        $('#iClient').append(`
              <option value="${e.id}">${e.name}</option>
            `);
                    });
                }
            }
        });
    }
    async function submitSeachFrom() {
        let from = $('#fDate').val();
        let to = $('#tDate').val();
        let ven = $('#iClient').val();
        let cnd = [];
      
        if (!from || from == '') {
            DM_TEMPLATE.showSystemNotification(0, `Select From Date.`);
            return;
        }
        if (!to || to == '') {
            DM_TEMPLATE.showSystemNotification(0, `Select To Date.`);
            return;
        }
        if (!ven || ven == '') {
            DM_TEMPLATE.showSystemNotification(0, `Select vendor .`);
            return;
        }

        if (from && from != '') {
            cnd.push({ 'key': 'date', 'operator': 'higher-equal', 'value': from + ' 00:00:00' });
        }
        if (to && to != '') {
            cnd.push({ 'key': 'date', 'operator': 'lower-equal', 'value': to + ' 23:59:59' });
        }
        if (ven && ven != '') {
            cnd.push({ 'key': 'vendor', 'operator': 'is', 'value': ven });
        }
       console.log(cnd);

        backendSource.getObject('payment', null, 
            { where: cnd ,
                order: {
                    type: 'desc',
                    by: 'id'
                },
                reference: [{ obj: 'vendor', a: 'id', b: 'vendor' }],
                select: "payment.*, vendor.name vName"
            }, function (data) {
            if (data.SUCCESS) {
                if (data.MESSAGE.length > 0) {
                    payment = data.MESSAGE;
                    console.log(payment);
                    showResult()
                } else {
                    $("#reportTbl").html(`<div class="text-center fw-bold fs-3">Sorry No Report found</div>`)
                }
            }
        })
    }
    function  showResult(){
      let html = '';
      
      payment.forEach((e)=>{
          html += `<tr>
                <td>${e.id}</td>
                <td >${e.vName}</td>
                <td >${moment(e.date).format('DD-MM-YYYY')}</td>
                <td>${e.payable_amount}</td>
                <td>${e.due}</td>
                <td>${e.total}</td>
                `
      })
        $('.reportTbl').html(`
            <div class="table-responsive">
                <table class="table table-striped" >
                    <thead>
                        <tr>
                            <th scope="col">SL</th>
                            <th scope="col">Vendor</th>
                            <th scope="col">Date</th>
                            <th scope="col">Pay</th>
                            <th scope="col">due</th>
                            <th scope="col">total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${html}
                    </tbody>
                </table>
            `)
    }
})();