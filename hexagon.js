class Hexagon extends HTMLElement {
	constructor(value, options) {
		super();
		this.value = value;
		this.valueNode = null;

		if(!options) return;
		this.options = options;
		this.x = options.x;
		this.y = options.y;
		this.z = options.z;
	}
	initValue() {
		const span = document.createElement('span');
		span.textContent = this.value;
		this.valueNode = span;
		this.appendChild(span);
	}
	setCoordinates() {
		this.setAttribute('data-x', this.x);
		this.setAttribute('data-y', this.y);
		this.setAttribute('data-z', this.z);
	}
	updateValue() {
		this.valueNode.textContent = this.value;
	}
	checkAbilityMerge(item) {
		return item.value === this.value ? true : false;
	}
	merge(item) {
		item.value += this.value;
		item.updateValue();
		this.remove();
	}
	connectedCallback() {
		this.initValue();
		this.style.top = this.options.top + 'px';
		this.style.left = this.options.left + 'px';
	}
}
customElements.define('hexagon-item', Hexagon);
