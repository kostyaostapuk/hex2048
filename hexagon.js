class Hexagon extends HTMLElement {
	constructor(value, options) {
		super();
		this.value = value;
		this.valueNode = null;

		if (options) {
			this.options = options;
			this.coordinates = this.options.coordinates ? this.options.coordinates : null;
			this.active = this.options.active ? this.options.active : null;
		}
	}
	initValue() {
		if (!this.active) return;
		const span = document.createElement('span');
		span.textContent = this.value;
		this.valueNode = span;
		this.appendChild(span);
		this.setAttribute('data-value', this.value);
	}
	setCoordinates(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.setAttribute('datat-x', this.x);
		this.setAttribute('data-y', this.y);
		this.setAttribute('data-z', this.z);
	}
	updateValue() {
		this.valueNode.textContent = this.value;
		this.setAttribute('data-value', this.value);
	}
	checkAbilityMerge(item) {
		return item.value === this.value ? true : false;
	}
	merge(item) {
		item.value += this.value;
		item.updateValue();
		this.remove();
	}
	setPosition() {
		this.style.top = this.options.top + 'px';
		this.style.left = this.options.left + 'px';
		this.style.zIndex = this.active ? 1 : 0;
	}
	connectedCallback() {
		this.initValue();
		this.setCoordinates(this.coordinates.x, this.coordinates.y, this.coordinates.z);
		this.setPosition();
	}
}
customElements.define('hexagon-item', Hexagon);
