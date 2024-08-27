document.addEventListener('DOMContentLoaded', () => {
  const toggleEditModeButton = document.getElementById('toggleEditMode');
  const editProductForm = document.getElementById('editProductForm');
  const formTitle = document.getElementById('formTitle');
  const productList = document.getElementById('productList');
  const inventoryList = document.getElementById('inventoryList');
  const walletAmountElement = document.getElementById('walletAmount');
  const totalCoinElement = document.getElementById('total_coin');
  const productNameInput = document.getElementById('productName');
  const productCoinsInput = document.getElementById('productCoins');
  const saveProductButton = document.getElementById('saveProduct');
  const cancelEditButton = document.getElementById('cancelEdit');
  const unauthorizedModal = document.getElementById('unauthorizedModal');
  const closeModal = document.getElementById('closeModal');
  const closeModalButton = document.getElementById('closeModalButton');
  const modalMessage = document.getElementById('modalMessage');
  const exportDataButton = document.getElementById('exportData');
  const importDataButton = document.getElementById('importDataButton');
  const importDataInput = document.getElementById('importData');

  let isEditMode = false;
  let products = loadData('products') || [];
  let inventory = loadData('inventory') || [];
  let walletAmount = loadCoin(); // Allow for decimal values
  let currentEditIndex = null;

  function updateUI() {
      productList.innerHTML = '';
      products.forEach((product, index) => {
          const li = document.createElement('li');
          li.draggable = true;
          li.setAttribute('data-index', index);

          li.innerHTML = `
              <span>${product.name}  (${product.coins.toFixed(2)} <img class="coin_img" src="images/coin.svg">)</span><span>
              ${isEditMode ? `<button class="btn remove" onclick="removeProduct(${index})">Remove</button>
              <button class="btn edit" onclick="editProduct(${index})">Edit</button>` : `<button class="btn" onclick="buyProduct(${index})">Buy</button>`}
          </span>`;

          addDragAndDropHandlers(li, products, 'product');
          productList.appendChild(li);
      });

      inventoryList.innerHTML = '';
      inventory.forEach((item, index) => {
          const li = document.createElement('li');
          li.draggable = true;
          li.setAttribute('data-index', index);
          li.innerHTML = `
              <span>${item.name}  (${item.coins.toFixed(2)} <img class="coin_img" src="images/coin.svg">)</span><span>
              <button class="btn" onclick="sellProduct(${index})">Sell</button>
              <button class="btn done" onclick="doneWithItem(${index})">Done</button>
          </span>`;
          addDragAndDropHandlers(li, inventory, 'inventory');
          inventoryList.appendChild(li);
      });

      walletAmountElement.textContent = walletAmount.toFixed(2);
      totalCoinElement.textContent = walletAmount.toFixed(2);

      editProductForm.classList.toggle('hidden', !isEditMode);
      formTitle.textContent = currentEditIndex !== null ? 'Editing Existing Task' : 'Add New Task';
      if (currentEditIndex === null) {
          editProductForm.classList.remove('shining-border');
      }

      saveData('products', products);
      saveData('inventory', inventory);
      saveCoin();
      // saveData('walletAmount', walletAmount);
  }

  function addDragAndDropHandlers(item, list, type) {
      item.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', item.getAttribute('data-index'));
          e.dataTransfer.effectAllowed = 'move';
          item.classList.add('dragging');
      });

      item.addEventListener('dragend', () => {
          item.classList.remove('dragging');
      });

      item.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
      });

      item.addEventListener('drop', (e) => {
          e.preventDefault();
          const draggedIndex = e.dataTransfer.getData('text/plain');
          const targetIndex = item.getAttribute('data-index');
          if (draggedIndex !== targetIndex) {
              const draggedItem = list[draggedIndex];
              list.splice(draggedIndex, 1);
              list.splice(targetIndex, 0, draggedItem);
              updateUI();
          }
      });
  }

  window.buyProduct = function(index) {
      const product = products[index];
      walletAmount = loadCoin();
      if (walletAmount >= product.coins) {
          walletAmount -= product.coins;
          inventory.push(product);
          updateUI();
      } else {
          showModal('Not enough coins in wallet.');
      }
  };

  window.sellProduct = function(index) {
      const item = inventory[index];
      walletAmount = loadCoin();
      walletAmount += item.coins;
      inventory.splice(index, 1);
      updateUI();
  };

  window.removeProduct = function(index) {
      products.splice(index, 1);
      updateUI();
  };

  window.editProduct = function(index) {
      currentEditIndex = index;
      const product = products[index];
      productNameInput.value = product.name;
      productCoinsInput.value = product.coins.toFixed(2);
      editProductForm.classList.remove('hidden');
      formTitle.textContent = 'Editing Existing Item';
      editProductForm.classList.add('shining-border');
      setTimeout(() => {
          editProductForm.classList.remove('shining-border');
      }, 2000);
  };

  window.doneWithItem = function(index) {
      inventory.splice(index, 1);
      updateUI();
  };

  function saveProduct() {
      const name = productNameInput.value;
      const coins = parseFloat(productCoinsInput.value);
      if (name && !isNaN(coins) && coins > 0) {
          if (currentEditIndex !== null) {
              products[currentEditIndex] = { name, coins };
              currentEditIndex = null;
          } else {
              products.push({ name, coins });
          }
          productNameInput.value = '';
          productCoinsInput.value = '';
          updateUI();
      } else {
          showModal('Name cannot be empty, or price must be greater than 0');
      }
  }

  function toggleEditMode() {
      isEditMode = !isEditMode;
      toggleEditModeButton.textContent = isEditMode ? 'Disable Edit Mode' : 'Enable Edit Mode';
      toggleEditModeButton.classList.toggle('green', !isEditMode);
      toggleEditModeButton.classList.toggle('red', isEditMode);
      updateUI();
  }

  function saveData(key, data) {
      localStorage.setItem(key, JSON.stringify(data));
  }

  function loadCoin(){
    const savedData = JSON.parse(localStorage.getItem("appData"))||{totalCoin:"0.00"};
    const coin = parseFloat(savedData.totalCoin);
    walletAmountElement.textContent = coin.toFixed(2);
    return coin;
  }

  function loadData(key) {
      return JSON.parse(localStorage.getItem(key));
  }

  function showModal(message) {
      modalMessage.textContent = message;
      unauthorizedModal.classList.remove('hidden');
  }

  function closeModalHandler() {
      unauthorizedModal.classList.add('hidden');
  }

  function exportData() {
      const data = {
          products,
          inventory,
          walletAmount
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'market_data.json';
      a.click();
      URL.revokeObjectURL(url);
  }

  function importData(event) {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = function(e) {
              try {
                  const data = JSON.parse(e.target.result);
                  products = data.products || [];
                  inventory = data.inventory || [];
                  walletAmount = data.walletAmount || 50.00;
                  updateUI();
              } catch (error) {
                  showModal('Failed to load data. Please ensure the file is a valid JSON.');
              }
          };
          reader.readAsText(file);
      }
  }

  toggleEditModeButton.addEventListener('click', toggleEditMode);
  saveProductButton.addEventListener('click', saveProduct);
  cancelEditButton.addEventListener('click', () => {
      editProductForm.classList.add('hidden');
      productNameInput.value = '';
      productCoinsInput.value = '';
      currentEditIndex = null;
      isEditMode = false;
      toggleEditModeButton.textContent = 'Enable Edit Mode';
      toggleEditModeButton.classList.add('green');
      toggleEditModeButton.classList.remove('red');
      updateUI();
  });
  closeModal.addEventListener('click', closeModalHandler);
  closeModalButton.addEventListener('click', closeModalHandler);
  exportDataButton.addEventListener('click', exportData);
  importDataInput.addEventListener('change', importData);
  importDataButton.addEventListener('click', () => importDataInput.click());
  updateUI();
});
