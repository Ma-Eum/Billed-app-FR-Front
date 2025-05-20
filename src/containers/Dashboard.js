import { formatDate } from '../app/format.js'
import DashboardFormUI from '../views/DashboardFormUI.js'
import BigBilledIcon from '../assets/svg/big_billed.js'
import { ROUTES_PATH } from '../constants/routes.js'
import USERS_TEST from '../constants/usersTest.js'

export const filteredBills = (data, status) => {
  return (data && data.length)
    ? data.filter(bill => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return false;

        const userEmail = user.email;
        const isTestUser = [...USERS_TEST, userEmail].includes(bill.email);
        return bill.status === status && !isTestUser;
      })
    : [];
}

export const card = (bill) => {
  const names = bill.email.split('@')[0];
  const [firstName, lastName] = names.includes('.') ? names.split('.') : ['', names];
  return (`
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `)
}

export const cards = (bills) => {
  return bills && bills.length ? bills.map(bill => card(bill)).join("") : ""
}

export const getStatus = (index) => {
  switch (index) {
    case 1: return "pending"
    case 2: return "accepted"
    case 3: return "refused"
    default: return ""
  }
}

export default class Dashboard {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    this.localStorage = localStorage

    const user = JSON.parse(this.localStorage.getItem("user"))
    if (!user) {
      this.onNavigate(ROUTES_PATH.Login)
      return
    }

    this.counter = {}

    // écoute les flèches de filtre
    $('#arrow-icon1').click((e) => this.handleShowTickets(e, bills, 1))
    $('#arrow-icon2').click((e) => this.handleShowTickets(e, bills, 2))
    $('#arrow-icon3').click((e) => this.handleShowTickets(e, bills, 3))

    // écoute le bouton déconnexion
    const logoutBtn = this.document.querySelector('#layout-disconnect')
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.localStorage.clear()
        this.onNavigate(ROUTES_PATH.Login)
      })
    }
  }

  handleClickIconEye = () => {
    const billUrl = $('#icon-eye-d').attr("data-bill-url")
    const imgWidth = Math.floor($('#modaleFileAdmin1').width() * 0.8)
    $('#modaleFileAdmin1').find(".modal-body").html(
      `<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`
    )
    if (typeof $('#modaleFileAdmin1').modal === 'function') {
      $('#modaleFileAdmin1').modal('show')
    }
  }

  handleEditTicket = (e, bill, bills) => {
    if (!this.counter[bill.id]) this.counter[bill.id] = 0
    this.counter[bill.id]++

    if (this.counter[bill.id] % 2 === 1) {
      // ouvrir
      bills.forEach(b => {
        $(`#open-bill${b.id}`).css({ background: '#0D5AE5' })
      })
      $(`#open-bill${bill.id}`).css({ background: '#2A2B35' })
      $('.dashboard-right-container div').html(DashboardFormUI(bill))
      $('.vertical-navbar').css({ height: '150vh' })
    } else {
      // refermer
      $(`#open-bill${bill.id}`).css({ background: '#0D5AE5' })
      $('.dashboard-right-container div').html(`
        <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
      `)
      $('.vertical-navbar').css({ height: '120vh' })
    }

    $('#icon-eye-d').click(this.handleClickIconEye)
    $('#btn-accept-bill').click((e) => this.handleAcceptSubmit(e, bill))
    $('#btn-refuse-bill').click((e) => this.handleRefuseSubmit(e, bill))
  }

  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH.Dashboard)
  }

  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH.Dashboard)
  }

  handleShowTickets = (e, bills, index) => {
    if (this.counter[index] === undefined) this.counter[index] = 0
    this.counter[index]++

    const status = getStatus(index)

    if (this.counter[index] % 2 === 1) {
      $(`#arrow-icon${index}`).css({ transform: 'rotate(0deg)' })
      $(`#status-bills-container${index}`).html(cards(filteredBills(bills, status)))
    } else {
      $(`#arrow-icon${index}`).css({ transform: 'rotate(90deg)' })
      $(`#status-bills-container${index}`).html("")
    }

    filteredBills(bills, status).forEach(bill => {
      $(`#open-bill${bill.id}`).click((e) => this.handleEditTicket(e, bill, bills))
    })
  }

  getBillsAllUsers = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then(snapshot => snapshot.map(doc => ({
          id: doc.id,
          ...doc,
          date: doc.date,
          status: doc.status
        })))
        .catch(error => {
          throw error
        })
    }
  }

  updateBill = (bill) => {
    if (this.store) {
      return this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: bill.id })
        .then(bill => bill)
        .catch(console.error)
    }
  }
}