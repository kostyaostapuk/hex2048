class HexagonGrid {
	constructor(dom, radius) {
		this.dom = dom;
		this.radius = radius;
		this.data = [];
		this.someMoved = false;

		this.container = document.getElementById('hexagon-grid-container');

		this.initEventHandler();
		this.generateHexagonGrid();

		this.getCoordinates([]).then((data) => {
			this.parseCoordinates(data);
			this.setStatus(true);
		});
	}
	getItemsByDirection(hexItem) {
		const arr = this.data.filter((item) => item[this.currentAxisDirection] === hexItem[this.currentAxisDirection]);
		return this.axisReverse ? arr.reverse() : arr;
	}
	setStatus(value) {
		const span = document.querySelector('[data-status]');
		const status = value ? 'playing' : 'game-over';
		span.textContent = status;
		span.setAttribute('data-status', status);
	}
	createHexagonSvg(item){
		debugger
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('fill', 'none');
		svg.setAttribute('height', "173.205");
		svg.setAttribute('width', "200");
		svg.setAttribute('viewBox', '0 0 190 164');
		svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
		
		const path = document.createElementNS(svg.namespaceURI ,'path');
		path.setAttribute('d','M47.3255 163.2L0 81.836L46.3707 0H142.802L190 82.3093L143.757 163.2H47.3255Z');
		path.setAttribute('fill', this.setColor.call(item));
		svg.appendChild(path);
		return svg;
	}
	setColor(){
		switch(this.value){
			case 2: return '#ece4db';
			case 4: return '#ebe0ca';
			case 8: return '#e9b381';		
			case 16: return '#e8996c';
			case 32: return '#e78267';	
			case 64: return '#e56747';
			case 128: return '#e8cf7f';
			default: return '#000000';
		}
	}
	updateColor(item){
		const path = item.querySelector('path');
		path.setAttribute('fill', this.setColor.call(item));
	}
	checkAllDirections() {
		const mergeStatuses = [];
		const activeItems = this.getActiveItems();
		['KeyW', 'KeyS', 'KeyA', 'KeyE', 'KeyD', 'KeyQ'].forEach((item) => {
			this.setDirection(item);
			activeItems.forEach((item) => {
				this.getItemsByDirection(item).forEach((item, index, direction) => {
					mergeStatuses.push(this.getMergeStatus(item, direction));
				});
			});
		});

		const statusValue = mergeStatuses.some((item) => item === true);
		this.setStatus(statusValue);
	}
	getMergeStatus(item, direction) {
		let x = item.x;
		let y = item.y;
		let z = item.z;

		const dirX = this.directionData.x;
		const dirY = this.directionData.y;
		const dirZ = this.directionData.z;
		const self = this;

		((item) => {
			switch (self.currentAxisDirection) {
				case 'x':
					y = item.y + dirY;
					z = item.z + dirZ;
					break;
				case 'y':
					x = item.x + dirX;
					z = item.z + dirZ;
					break;
				case 'z':
					x = item.x + dirX;
					y = item.y + dirY;
					break;
			}
		})(item);

		const newCoordinates = this.findItem(direction, x, y, z);
		return newCoordinates ? item.htmlElement.checkAbilityMerge(newCoordinates.htmlElement) : false;
	}
	setDirection(key) {
		this.axisReverse = false;
		switch (key) {
			case 'KeyW':
				this.currentAxisDirection = 'x';
				this.directionData = { x: 0, y: 1, z: -1 };
				break;
			case 'KeyS':
				this.currentAxisDirection = 'x';
				this.directionData = { x: 0, y: -1, z: 1 };
				break;
			case 'KeyA':
				this.currentAxisDirection = 'y';
				this.directionData = { x: -1, y: 0, z: 1 };
				break;
			case 'KeyE':
				this.currentAxisDirection = 'y';
				this.directionData = { x: 1, y: 0, z: -1 };
				this.axisReverse = true;
				break;
			case 'KeyD':
				this.currentAxisDirection = 'z';
				this.directionData = { x: 1, y: -1, z: 0 };
				break;
			case 'KeyQ':
				this.currentAxisDirection = 'z';
				this.directionData = { x: -1, y: 1, z: 0 };
				break;

			default:
				this.currentAxisDirection = null;
			break;
		}
	}
	initEventHandler() {
		document.addEventListener('keydown', (e) => {
			if (e.repeat) return;
			this.setDirection(e.code);

			if (!this.currentAxisDirection) return;
			this.moveItemsByDirection();

			if (!this.someMoved) return;

			(async () => {
				const newCoordinates = await this.getCoordinates(this.getUpdatedDataCoordinates());
				this.parseCoordinates(newCoordinates);
				this.someMoved = false;
			})();
		});
		document.addEventListener('keyup', (e) => {
			if (e.repeat) return;
			this.setDirection(e.code);
			if (!this.currentAxisDirection) return;

			const timeout = setTimeout(() => {
				if (this.getActiveItems().length === this.data.length) {
					this.checkAllDirections();
					clearTimeout(timeout);
				}
			}, 100);
		});
	}
	getActiveItems() {
		return this.data.filter((item) => item.htmlElement !== null);
	}
	findItem(arr, x, y, z) {
		let item;
		arr.forEach((gridItem) => {
			if (gridItem.x === x && gridItem.y === y && gridItem.z === z) {
				item = gridItem;
			}
		});
		return item;
	}
	updateCellValue(item, value){
		const x = item.x;
		const y = item.y;
		const z = item.z;
		const cell = document.querySelector(`#hexagon-grid > [data-x='${x}'][data-y='${y}'][data-z='${z}']`);
		cell.setAttribute('data-value', value);
	}
	move(item, direction) {
		const range = this.radius-1;
		let x = item.x;
		let y = item.y;
		let z = item.z;

		const dirX = this.directionData.x;
		const dirY = this.directionData.y;
		const dirZ = this.directionData.z;
		const self = this;

		function stepByAxis(item) {
			switch (self.currentAxisDirection) {
				case 'x':
					y = item.y + dirY;
					z = item.z + dirZ;
					break;
				case 'y':
					x = item.x + dirX;
					z = item.z + dirZ;
					break;
				case 'z':
					x = item.x + dirX;
					y = item.y + dirY;
					break;
			}
		}

		stepByAxis(item);
		do {
			const newCoordinates = this.findItem(direction, x, y, z);

			if (!newCoordinates) return;
			if (!item.htmlElement) return;

			if (!newCoordinates.htmlElement) {
				this.setCellCoordinates(item.htmlElement, newCoordinates.top, newCoordinates.left);
				this.updateCellValue(item, 0);

				newCoordinates.htmlElement = item.htmlElement;

				item.htmlElement = null;	
				item = newCoordinates;
				this.updateCellValue(newCoordinates, newCoordinates.htmlElement.value);
			} else {
				const canMerge = item.htmlElement.checkAbilityMerge(newCoordinates.htmlElement);
				if (!canMerge) return;

				item.htmlElement.merge(newCoordinates.htmlElement);
				this.updateColor(newCoordinates.htmlElement, newCoordinates.htmlElement.value);
				this.updateCellValue(newCoordinates, newCoordinates.htmlElement.value);
				this.updateCellValue(item, 0);
				item.htmlElement = null;
			}

			this.someMoved = true;
			stepByAxis(newCoordinates);
		} while (x >= -range && x <= range && y >= -range && y <= range && z >= -range && z <= range);
	}
	moveItemsByDirection() {
		this.getActiveItems().forEach((item) => {
			this.getItemsByDirection(item).forEach((item, index, direction) => {
				this.move(item, direction);
			});
		});
	}
	renderActiveHexagons() {
		this.getActiveItems().forEach((item) => {
			const hexagon = item.htmlElement;
			if (!hexagon) return;
			if (hexagon.isConnected) return;			
			
			hexagon.appendChild(this.createHexagonSvg(hexagon));			
			this.container.appendChild(hexagon);
			this.updateCellValue(hexagon,hexagon.value);
		});
	}
	parseCoordinates(points) {
		points.forEach((point) => {
			this.data.forEach((item) => {
				if (item.htmlElement) return;
				if (point.x === item.x && point.y === item.y && point.z === item.z) {
					item.htmlElement = new Hexagon(point.value, {
						top: item.top,
						left: item.left,
						x: point.x,
						y: point.y,
						z: point.z
					});
				}
			});
		});
		this.renderActiveHexagons();
	}
	async getCoordinates(arr) {
		const response = await fetch(`http://localhost:13337/${this.radius}`, {
			method: 'POST',
			body: JSON.stringify(arr),
		});
		try {
			return response.json();
		} catch (err) {
			alert(err.message);
		}
	}
	createCell(data){
		const { x, y, z, top, left, value } = data;
		const div = document.createElement('div');
		div.classList.add('cell');

		div.setAttribute('data-x', x);
		div.setAttribute('data-y', y);
		div.setAttribute('data-z', z);
		div.setAttribute('data-value', value ? value : 0);

		this.setCellCoordinates(div, top, left);
		return div;
	}
	setCellCoordinates(item, top, left){        
		item.style.top = top + 'px';            
		item.style.left = left + 'px';          
	}
	cubeToEvenq(cube){
		const col = cube.x
		const row = cube.z + (cube.x + (cube.x&1)) / 2
		return {col: col, row: row};
	}
	evenqOffsetToPixel(hex){
		const x = 94 * 3 / 2 * hex.col;
		const y = 94 * Math.sqrt(3) * (hex.row - 0.5 * (hex.col&1));
		return { x:x, y:y };
	}
	generateHexagonGrid(){
		const computedStyle = getComputedStyle(this.dom);
		const offsetY = (parseInt(computedStyle.height)/2) - parseInt(computedStyle.padding);
		const offsetX = (parseInt(computedStyle.width)/2) - parseInt(computedStyle.padding);

		const range = this.radius - 1;
		
		for (let q = -range; q <= range; q++) {
			let r1 = Math.max(-range, -q - range);
			let r2 = Math.min(range, -q + range);
			for (let r = r1; r <= r2; r++) {
				const x = q;
				const y = r;
				const z = -q-r;
				const coords = this.cubeToEvenq({x: x, y: y, z: z});
				const coordsPx = this.evenqOffsetToPixel(coords);
				const left = offsetX + coordsPx.x;
				const top = offsetY + coordsPx.y;

				const dataCell = {
					left: left,
					top:  top,
					x: x,
					y: y,
					z: z,
				}
				const gridCell = this.createCell(dataCell);
				this.dom.appendChild(gridCell);
				this.data.push({
					...dataCell,
					htmlElement: null
				});
			}
		}
	}
	getUpdatedDataCoordinates() {
		return this.getActiveItems().map((item) => {
			return { x: item.x, y: item.y, z: item.z, value: item.htmlElement.value };
		});
	}
}
