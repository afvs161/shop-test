// custom state
const useState = (defaultValue) => {
	let value = defaultValue
	const getValue = () => value
	const setValue = (newValue) => (value = newValue)
	return [getValue, setValue]
}

const productsWrapper = document.querySelector("#itemWrapper"),
	pagination = document.querySelector("#paginationBtnWrapper"),
	categorySelect = document.querySelector("#category"),
	modal = document.querySelector("#modalWrapper"),
	modalContent = document.querySelector("#modalContent"),
	modalBtn = document.querySelector("#modalBtn"),
	modalTotalPrice = document.querySelector("#totalPriceSpan"),
	loader = document.querySelector("#loader")

const [data, setData] = useState([])
const [filteredData, setFilteredData] = useState([])
const [basket, setBasket] = useState([])
const [loading, setLoading] = useState(true)
const itemsPerPage = 20
let currentPage = 1

getData()

// page load and fetch detect
document.addEventListener("DOMContentLoaded", () => {
	let checkLoaded = setInterval(() => {
		if (!loading()) {
			// call categories
			loader.remove()

			const uniqueCategories = [...new Set(data().map((item) => item.category))]
			categorySelect.innerHTML = ""
			const option = document.createElement("option")
			option.textContent = "All categories"
			option.value = "all"
			categorySelect.appendChild(option)
			uniqueCategories.forEach((category) => {
				const option = document.createElement("option")
				option.textContent = category
				option.value = category
				categorySelect.appendChild(option)
			})

			// call carts
			data().length
				? data().forEach((item, idx) => {
						displayCartItem(item)
				  })
				: (productsWrapper.innerHTML = `<h2>No product found</h2>`)

			// call pagination
			showPage(currentPage)
			createPaginationButtons()
			updatePaginationButtons()
			clearInterval(checkLoaded)
		}
	}, 10)
})

productsWrapper.addEventListener("click", addProductToBasket)

modalBtn.addEventListener("click", toggleModal)

document.addEventListener("keydown", (e) => {
	if (e.key === "Escape") {
		toggleModal()
	}
})

modal.addEventListener("click", (e) => {
	if (e.target.classList.contains("modal-wrapper")) {
		toggleModal()
	} else if (e.target.classList.contains("inc-item-btn")) {
		const index = basket().findIndex((item) => item.id == e.target.dataset.id)
		basket()[index].quantity++
		displayBasketItem(basket())
		totalPrice(basket())
	} else if (e.target.classList.contains("del-item-btn")) {
		const index = basket().findIndex((item) => item.id == e.target.dataset.id)
		basket().splice(index, 1)
		displayBasketItem(basket())
		totalPrice(basket())
		alert("Product successfully removed from the cart")
	} else if (e.target.classList.contains("dec-item-btn")) {
		const index = basket().findIndex((item) => item.id == e.target.dataset.id)
		if (basket()[index].quantity > 1) {
			basket()[index].quantity--
			displayBasketItem(basket())
			totalPrice(basket())
		}
	}
})

categorySelect.addEventListener("change", filterByCategory)

// add product to basket
function addProductToBasket(e) {
	if (e.target.classList.contains("add-to-basket")) {
		let newProductObj
		const index = basket().findIndex((item) => item.id == e.target.dataset.id)
		if (index !== -1) {
			basket()[index].quantity++
		} else {
			let newObj = data().filter((item) => item.id == e.target.dataset.id)[0]
			newProductObj = { ...newObj, quantity: 1 }
			setBasket([...basket(), newProductObj])
		}

		alert("Product successfully added to cart")
		displayBasketItem(basket())
		totalPrice(basket())
	}
}

// calculate cart total price
function totalPrice(arr) {
	let summa = arr.reduce((sum, el) => {
		return sum + +el.price * el.quantity
	}, 0)
	modalTotalPrice.textContent = summa
}

// display product as basket item
function displayBasketItem(arr) {
	modalContent.innerHTML = ""
	if (arr.length) {
		arr.forEach((item) => {
			const modalItem = document.createElement("div")
			modalItem.classList.add("modal-item")
			modalItem.innerHTML = `
        <div class="modal-item-img">
          <img
            src=${item.thumbnail}
            alt=${item.title}
          />
        </div>

        <div class="modal-item-info">
          <h4>${item.title}</h4>
          <h5>Price: $${item.price} &nbsp; Quantity: x${item.quantity}</h5>
        </div>

        <div class="modal-item-btn-group">
          <button class="dec-item-btn" data-id=${item.id}>-</button>
          <button class="del-item-btn" data-id=${item.id}>x</button>
          <button class="inc-item-btn" data-id=${item.id}>+</button>
        </div>
      `
			modalContent.append(modalItem)
		})
	} else {
		modalContent.innerHTML = `<h3>No product in basket :(</h3>`
	}
}

// toggle modal
function toggleModal() {
	modal.classList.toggle("hide")
	if (!modal.classList.contains("hide")) {
		document.querySelector("body").style.overflow = "hidden"
	} else {
		document.querySelector("body").style.overflow = "auto"
	}
}

// filter by category
function filterByCategory(e) {
	if (e.target.value === "all") {
		setFilteredData(data())
	} else {
		setFilteredData(data().filter((item) => item.category == e.target.value))
	}
	productsWrapper.innerHTML = ""
	filteredData().forEach((item, idx) => {
		displayCartItem(item)
	})
	pagination.innerHTML = ""
	createPaginationButtons()
	updatePaginationButtons()
	pagination.childNodes.forEach((item) => {
		item.classList.remove("active")
	})
	pagination.childNodes[0].classList.add("active")
}

// get value
function getData() {
	fetch("https://dummyjson.com/products")
		.then((res) => res.json())
		.then((data) => {
			setData(data.products)
			setFilteredData(data.products)
			setLoading(false)
		})
		.catch((error) => {
			pagination.innerHTML = ""
			productsWrapper.innerHTML = `<h2>No product found</h2>`
			console.log(error)
		})
}

// display product as card item
function displayCartItem(item) {
	const productDiv = document.createElement("div")
	productDiv.classList.add("item")
	productDiv.innerHTML = `
    <div class="item-img">
      <img src="${item.thumbnail}" alt="${item.title} image" />
    </div>
    <div class="item-info">
      <h4>${item.title.slice(0, 15)}${item.title.length > 15 && "..."}</h4>
      <div class="item-info-between">
        <span>Price: $${item.price}</span>
        <span
          >Category:&nbsp;<span class="category-badge"
            >${item.category}</span
          ></span
        >
      </div>
      <button class="add-to-basket" data-id=${item.id}>Add to cart</button>
    </div>
  `
	productsWrapper.append(productDiv)
}

// creating pagination
function showPage(page) {
	const startIndex = (page - 1) * itemsPerPage
	const endIndex = startIndex + itemsPerPage
	const contentItems = Array.from(productsWrapper.children)

	contentItems.forEach((item, index) => {
		if (index >= startIndex && index < endIndex) {
			item.style.display = "block"
		} else {
			item.style.display = "none"
		}
	})
}
function createPaginationButtons() {
	const numPages = Math.ceil(
		document.getElementById("itemWrapper").children.length / itemsPerPage
	)

	for (let i = 1; i <= numPages; i++) {
		const paginationBtn = document.createElement("button")
		paginationBtn.classList.add("pagination-btn")
		paginationBtn.textContent = i
		paginationBtn.addEventListener("click", () => {
			currentPage = i
			showPage(currentPage)
			updatePaginationButtons()
		})
		pagination.appendChild(paginationBtn)
	}
}
function updatePaginationButtons() {
	const paginationButtons = document.querySelectorAll(".pagination-btn")
	for (let i = 0; i < paginationButtons.length; i++) {
		// paginationButtons[currentPage - 1].classList.add("active")
		if (i === currentPage - 1) {
			paginationButtons[i].classList.add("active")
		} else {
			paginationButtons[i].classList.remove("active")
		}
	}
}
