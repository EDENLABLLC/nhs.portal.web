import { BEM, selector, buildClass } from './dom';

const HOVER_DEBOUNCE_TIMEOUT = 200;

const createItem = (data) => {
  const node = document.createElement('li');

  node.classList.add(selector('search', 'result-item'));
  node.innerHTML = `
    <div class="search__result-item-title">
        ${data.name}
    </div>
    ${data.address.settlement} <br />
    ${data.address.street}, ${data.address.building} <br />
    Тел.: ${data.phones[0].number} <br />
    Години роботи: Пн-Пт, 9:00-19:00
  `;

  return node;
};

const getTooltipContent = data => (
  `<div class="search__map-tooltip">
    <b>${data.name}</b> <br />
    ${data.address.settlement} <br />
    ${data.address.street}, ${data.address.building} <br />
    Тел.: ${data.phones[0].number} <br />
    
    <div class="search__map-tooltip-count">
        ${data.doctors}
        <small>лікарів</small>
    </div>
    <div class="search__map-tooltip-count">
        ${data.declarations}
        <small>декларацій підписано</small>
    </div>
  </div>`
);

export default class Search extends BEM {
  markers = [];
  $markerNodes = [];

  timeout = null;

  constructor(node, data) {
    super('search', node);

    this.$result = this.elem('result');

    this.data = data;
    this.map = new google.maps.Map(this.elem('map'), {
      center: { lat: 50.4021368, lng: 30.4525107 },
      zoom: 11
    });

    this.tooltip = new google.maps.InfoWindow({
      maxWidth: 250,
      pixelOffset: new google.maps.Size(136,388),
      zIndex: -2
    });

    const fragment = document.createDocumentFragment();

    this.data.forEach((item, index) => {
      const node = createItem(item);

      node.dataset.index = index;
      fragment.appendChild(node);

      const marker = this.createMarker(item.address.coordinates);
      this.markers.push(marker);
      this.$markerNodes.push(node);

      marker.addListener('click', () => this.setActive(index));
      marker.addListener('mouseover', ({ ta }) => {
        this.onHoverMarker(index, 'over', ta.target);
      });
      marker.addListener('mouseout', () => this.onHoverMarker(index, 'out'));
    });

    this.$result.appendChild(fragment);

    this.$result.addEventListener('click', ({ target }) => {
      const $item = target.closest(buildClass(this.name, 'result-item'));

      if ($item === null) {
        return;
      }

      this.map.setCenter({
        lat: this.data[$item.dataset.index].address.coordinates[0],
        lng: this.data[$item.dataset.index].address.coordinates[1]
      });

      this.map.setZoom(11);

      this.setActive($item.dataset.index);
    }, false);

    this.activeMarker = new google.maps.Marker({
      map: this.map,
      zIndex: 2,
      icon: {
        url: 'images/icons/marker.png',
        scaledSize: new google.maps.Size(33, 47),
        anchor: new google.maps.Point(17, 60),
      }
    });
  }

  onHoverMarker(index, type) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      switch (type) {
        case 'over':
          this.showTooltip(index);
          break;
        case 'out':
          this.hideTooltip();
          break;
      }
    }, HOVER_DEBOUNCE_TIMEOUT);
  }

  hideTooltip() {
    const node = this.$tooltipNode;

    if (!node) {
      return;
    }

    const player = node.animate([
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-20px)' }
    ], this.constructor.ANIMATION_OPTIONS);

    const marker = this.hoverMarker;
    let size = 20;
    requestAnimationFrame(function animate() {
      if (size <= 0) {
        marker.setMap(null);
        return;
      }

      marker.setIcon({ ...marker.getIcon(), scale: size});
      size = size - 2;
      requestAnimationFrame(animate);
    });

    player.onfinish = () => {
      this.tooltip.close();
    };

    this.activeIndex = -1;
  }

  showTooltip(index) {
    if (index === this.activeIndex) {
      return;
    }

    this.tooltip.setContent(getTooltipContent(this.data[index]));
    this.tooltip.open(this.map, this.markers[index]);

    const node = this.$tooltipNode = this.tooltipNode.parentNode;
    node.removeChild(node.firstChild);
    node.removeChild(node.lastChild);

    node.addEventListener('mouseover', () => {
      clearTimeout(this.timeout);
    }, false);

    node.addEventListener('mouseout', () => {
      this.onHoverMarker(index, 'out');
    }, false);

    if (this.hoverMarker) {
      this.hoverMarker.setMap(null);
    }

    const marker = this.hoverMarker = new google.maps.Marker({
      position: {
        lat: this.data[index].address.coordinates[0],
        lng: this.data[index].address.coordinates[1]
      },
      zIndex: -2,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 0,
        strokeColor: '#4880ed',
        fillOpacity: 1,
        fillColor: '#4880ed'
      },
      opacity: .1,
      draggable: true,
      map: this.map
    });

    this.activeIndex = index;

    marker.addListener('mouseover', () => {
      this.onHoverMarker(index, 'over');
    });

    marker.addListener('mouseout', () => {
      this.onHoverMarker(index, 'out');
    });

    let size = 0;
    requestAnimationFrame(function animate() {
      if (size >= 20) {
        return;
      }

      marker.setIcon({ ...marker.getIcon(), scale: size});
      size = size + 2;
      requestAnimationFrame(animate);
    });

    if (index === this.activeMarkerIndex) {
      this.tooltipNode.animate([
        { opacity: 0, transform: 'translateY(0px)' },
        { opacity: 1, transform: 'translateY(10px)' }
      ], this.constructor.ANIMATION_OPTIONS);
    } else {
      this.tooltipNode.animate([
        { opacity: 0, transform: 'translateY(-20px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], this.constructor.ANIMATION_OPTIONS);
    }
  }

  setActive(index) {
    if (index === this.activeMarkerIndex) {
      return;
    }

    const { address } = this.data[index];
    const $item = this.$markerNodes[index];

    if (index === this.activeIndex) {
      this.tooltipNode.style.top = '18px';
    }

    if (this.$active) {
      this.delMod(this.$active, 'result-item', 'active');
      this.markers[this.$active.dataset.index].setIcon(this.defaultMarkerIcon);
    }

    this.setMod($item, 'result-item', 'active');
    this.$active = $item;
    this.activeMarkerIndex = Number(index);

    this.markers[$item.dataset.index].setIcon(this.activeMarkerIcon);

    this.activeMarker.setPosition({ lat: address.coordinates[0], lng: address.coordinates[1] })
  }

  createMarker([lat, lng]) {
    return new google.maps.Marker({
      position: {lat, lng},
      zIndex: -1,
      icon: this.defaultMarkerIcon,
      draggable: false,
      map: this.map
    });
  }

  get defaultMarkerIcon() {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 4,
      strokeColor: '#4880ed',
      fillOpacity: 1,
      fillColor: '#4880ed'
    };
  }

  get activeMarkerIcon() {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      strokeColor: '#4880ed',
      fillOpacity: 1,
      fillColor: '#ffffff',
      strokeWeight: 6
    };
  }

  get tooltipNode() {
    return document.querySelector('.gm-style-iw');
  }

  static ANIMATION_OPTIONS = {
    duration: 200,
    fill: 'forwards',
    easing: 'ease-in-out'
  }
}