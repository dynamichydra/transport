'use strict';

(function () {

    const popup = document.getElementById("sitePopup");
    let payment = [];
    let DATALIMIT = 15;
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
        $('.searchVendor').on('click', getVendor);
        $('.container').on('click', `.Next`, function () {
            console.log("working");
            DATASTART = DATASTART + DATALIMIT;
            getVendor()
        });
    }

    async function getVendor() {
        DM_TEMPLATE.showBtnLoader(elq('.searchUser'), true);
        let uEmail = $('#uEmail').val();
        let uName = $('#uName').val();
        let uPh = $('#uPhone').val();
        let uStatus = $('#uStatus').find(":selected").val();
        let cnd = [];
        let lim = {
            start: DATASTART,
            end: DATASTART + DATALIMIT
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
        backendSource.getObject('payment', null, {
            where: cnd,
            limit: lim,
            order: {
                type: 'desc',
                by: 'id'
            },
            reference: [{ obj: 'vendor', a: 'id', b: 'vendor' }],
            select: "payment.*, vendor.name vName "
        }, function (data) {
            if (data.SUCCESS) {
                payment = data.MESSAGE;
                console.log(payment);
                $('#tblPayment tbody').html('');
                if (data.MESSAGE.length > 0) {
                    data.MESSAGE.map((e) => {
                        $('#tblPayment tbody').append(`
              <tr>
                <td>${e.id}</td>
                <td>${e.date}</td>
                <td> Challan ${e.part_challan_id}</td>
                <td>${e.vName}</td>
                <td >${e.payable_amount}</td>
                <td >${e.due}</td>
                <td >${e.total}</td>
                <td>
                 <div style="display:flex; justify-content:start">
                 <span class="actionBtn"><a href="/master/index.html#/payment/editpayment/${e.id}"><i class="bi bi-pencil-square"></i></a></span>
                 <span class="actionBtn" data-deleteid="${e.id}"><i class="bi bi-trash"></i></span>
                 </div>
                </td>
              </tr>
            `);
                    });
                } else {
                    $('#tblPayment tbody').append(`
              <tr>
                <td colspan="9">No record found</td>
              </tr>
            `);
                }
            }
            DM_TEMPLATE.showBtnLoader(elq('.searchUser'), false);
        });
    }

})();