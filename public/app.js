function toCurrency(){
    document.querySelectorAll('.price').forEach(node => {
        node.textContent = new Intl.NumberFormat('ru-RU', {
            currency: 'rub',
            style: 'currency'
        }).format(node.textContent)
    })
}
toCurrency()

const $card = document.querySelector('#card')

if ($card) {
    $card.addEventListener('click', event => {
        if (event.target.classList.contains('js-remove')) {
            fetch('/card/remove/' + event.target.dataset.id, {
                method: 'delete'
            }).then(res => res.json())
                .then((card) => {
                    if (card.courses.length) {
                        const html = card.courses.map(c => {
                            return `
                                        <tr>
                                           <td>${c.title}</td>
                                           <td>${c.count}</td>
                                           <td>
                                             <button class="btn btn-small js-remove" data-id="${c.id}">Delete</button>
                                           </td>
                                        </tr>
                        `
                        }).join('');
                        $card.querySelector('tbody').innerHTML = html;
                        $card.querySelector('.price').textContent = card.price;
                    } else {
                        $card.innerHTML = '<p>Card is empty</p>'
                    }
                    toCurrency()
                })
        }
    })
}