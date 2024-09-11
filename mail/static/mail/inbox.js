document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = () => {
    send_email()
    return false
  }
  load_mailbox('inbox')
})

function send_email(){
  const to = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const body = document.querySelector('#compose-body');
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: to.value,
        subject: subject.value,
        body: body.value
    })
  })
  .then(response => response.json())
  .then(result => {console.log(result)})
  .then(() => {load_mailbox('inbox')})
}

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) { 
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  // Show the relevant emails
  const emailTable = document.createElement("table")
  emailTable.id = "email-table"
  emailTable.setAttribute("class", "table table-bordered")
  document.querySelector('#emails-view').appendChild(emailTable)
  const emailTableHeader = document.createElement("thead")
  //Add headings to email table
  if (mailbox == "sent") {
    var headings = ["To", "Body", "Timestamp"];
  } else {
    var headings = ["From", "Body", "Timestamp"];
  }
  headings.forEach(heading => {
    const cell = document.createElement("th")
    cell.innerHTML = heading
    emailTableHeader.appendChild(cell)
  })
  document.querySelector('#email-table').appendChild(emailTableHeader)

  // Get emails and add them to the table
  fetch(`/emails/${mailbox}`)  
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      const row = document.createElement("tr")
      const rowEmail = document.createElement("td")
      const rowSubject = document.createElement("td")
      const rowTime = document.createElement("td")
      
      if (mailbox == 'sent') {
        rowEmail.innerHTML = email.recipients
      } else {
        rowEmail.innerHTML = email.sender
      }
      rowSubject.innerHTML = email.subject
      rowTime.innerHTML = email.timestamp
      
      row.appendChild(rowEmail)
      row.appendChild(rowSubject)
      row.appendChild(rowTime)

      if (!email.read) {
        row.setAttribute("class", "table-secondary")
        row.style.backgroundColor = "gray"
      } else {
        row.setAttribute("class", "table-light")
      }
      element = document.querySelector('#email-table').appendChild(row)
      element.addEventListener("click", () => {
        load_email(email.id, mailbox)
      })
    
      return false;
    });
    })
}

function load_email(id, mailbox) { 
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Render email as card
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    const subject = email.subject
    const emailCard = `<div class="card"><div class="card-body">
    <h5 class="card-title">${subject.charAt(0).toUpperCase() + subject.slice(1)}</h5>
    <h6 class="card-subtitle mb-2 text-body-secondary"><i>${email.timestamp}</i>
    <p>To: ${email.recipients}  
    From: ${email.sender}</p>
    </h6>
    <p class="card-text">${email.body}</p>
    <div id="footer"></div></div></div>`
    document.querySelector('#emails-view').innerHTML = emailCard;

    // Mark email as read
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })
    .then(() => {console.log('Marked as read.')})

    // Add reply button
    reply = document.createElement("button");
    reply.innerHTML = 'Reply';
    reply.setAttribute("class", "btn btn-sm btn-outline-primary");
    replyButton = document.querySelector('#footer').appendChild(reply);
    replyButton.addEventListener("click", () => {
      reply_email(id)
    });

    //Add Archive/unarchive button (As long as email not from sent mailbox)
    if (!(mailbox === 'sent')) {
      add_archive_button(email)
    }

  })    
}

function add_archive_button(email) {
  // Archive/unarchive Button
  archive = document.createElement("button");
  if (!email.archived) {
    archive.innerHTML = 'Archive';
  } else {
    archive.innerHTML = 'Un-archive';
  }
  archive.setAttribute("class", "btn m-1 btn-sm btn-outline-primary");
  archiveButton = document.querySelector('#footer').appendChild(archive);
  archiveButton.addEventListener("click", () => {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: !email.archived
      })
    })
    .then(() => {load_email(email.id)})
  })
}

function reply_email(id) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Fetch the email and set values in form
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    document.querySelector('#compose-recipients').value = email.sender;
    // Adds RE: only if not already present
    if (email.subject.slice(0,3) ==="RE:") {
      document.querySelector('#compose-subject').value = `${email.subject}`
    } else {
      document.querySelector('#compose-subject').value = `RE:${email.subject}`
    }
    document.querySelector('#compose-body').value = `
    
    On ${email.timestamp} ${email.sender} wrote:
    ${email.body}`;
  })
}
