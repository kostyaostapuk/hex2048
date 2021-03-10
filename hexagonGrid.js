const data = [
	{
		x: -1,
		y: 0,
		z: 1,
		top: 103.9,
		left: 50,
		htmlElement: null,
	},
	{
		x: -1,
		y: 1,
		z: 0,
		top: 51.95,
		left: 50,
		htmlElement: null,
	},

	{
		x: 0,
		y: -1,
		z: 1,
		top: 129.875,
		left: 94,
		htmlElement: null,
	},
	{
		x: 0,
		y: 0,
		z: 0,
		top: 77.925,
		left: 94,
		htmlElement: null,
	},
	{
		x: 0,
		y: 1,
		z: -1,
		top: 25.975,
		left: 94,
		htmlElement: null,
	},
	{
		x: 1,
		y: -1,
		z: 0,
		top: 103.9,
		left: 138,
		htmlElement: null,
	},
	{
		x: 1,
		y: 0,
		z: -1,
		top: 51.95,
		left: 138,
		htmlElement: null,
	},
];
class HexagonGrid {
	constructor(dom) {
		this.dom = dom;
		this.data = data;
		this.someMoved = false;

		this.container = document.createElement('div');
		this.dom.appendChild(this.container);

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
				return;
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
		document.addEventListener('keyup', () => {
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
	move(item, direction) {
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
				item.htmlElement.style.top = newCoordinates.top + 'px';
				item.htmlElement.style.left = newCoordinates.left + 'px';

				newCoordinates.htmlElement = item.htmlElement;

				item.htmlElement = null;
				item = newCoordinates;

				newCoordinates.htmlElement.setCoordinates(x, y, z);
			} else {
				const canMerge = item.htmlElement.checkAbilityMerge(newCoordinates.htmlElement);
				if (!canMerge) return;

				item.htmlElement.merge(newCoordinates.htmlElement);
				item.htmlElement = null;
				newCoordinates.htmlElement.setCoordinates(x, y, z);
			}
			this.someMoved = true;
			stepByAxis(newCoordinates);
		} while (x >= -1 && x <= 1 && y >= -1 && y <= 1 && z >= -1 && z <= 1);
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
			if (!item.htmlElement) return;
			if (item.htmlElement.isConnected) return;
			this.container.appendChild(item.htmlElement);
		});
	}
	parseCoordinates(points) {
		points.forEach((point) => {
			this.data.forEach((item) => {
				if (item.htmlElement) return;
				if (point.x === item.x && point.y === item.y && point.z === item.z) {
					item.htmlElement = new Hexagon(point.value, {
						active: true,
						top: item.top,
						left: item.left,
						coordinates: {
							x: point.x,
							y: point.y,
							z: point.z,
						},
					});
				}
			});
		});
		this.renderActiveHexagons();
	}
	async getCoordinates(arr) {
		const response = await fetch('http://51.15.207.127:13337/2', {
			method: 'POST',
			body: JSON.stringify(arr),
		});
		try {
			return response.json();
		} catch (err) {
			alert(err.message);
		}
	}
	generateHexagonGrid() {
		this.data.forEach((point) => {
			const hex = new Hexagon(null, {
				active: false,
				top: point.top,
				left: point.left,
				coordinates: {
					x: point.x,
					y: point.y,
					z: point.z,
				},
			});
			this.dom.appendChild(hex);
		});
	}
	getUpdatedDataCoordinates() {
		return this.getActiveItems().map((item) => {
			return { x: item.x, y: item.y, z: item.z, value: item.htmlElement.value };
		});
	}
}
