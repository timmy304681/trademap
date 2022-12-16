L.Control.FeatureLegend = L.Control.extend({
    options: {
        position: 'topleft',
        title: 'Legend',
        symbolContainerSize: 24,
        maxSymbolSize: 24,
        minSymbolSize: 2,
        collapsed: false,
        drawShadows: false,
        symbolScaling: "clamped",
    },

    initialize: function (items, options) {
        L.Util.setOptions(this, options);
        this.items = items;
        this._symbols = [];
        this.symbolSize = this.options.maxSymbolSize;
        this.symbolScalingOptions = [
            "proportional",
            "maximum",
            "clamped",
            "none",
        ];
        this.scale = 1;
        this.offset = 0;

        this._sanityCheck();
        this._buildContainer();

        this._calculateScaling();
        this._symbols.forEach((symbol) => {
            symbol.rescale();
        })
    },

    // For proportional scaling
    _calculateScaling: function () {
        // Current range
        let A = this._getSmallestSymbolSize();
        let B = this._getLargestSymbolSize();

        // Rescaled range
        let C = this.options.minSymbolSize;
        let D = this.options.maxSymbolSize;

        this.scale = (D - C) / (B - A);
        this.offset = -A * this.scale + C;
    },

    // Run some checks on user parameters to make sure they are reasonable
    _sanityCheck: function () {
        if (this.options.maxSymbolSize > this.options.symbolContainerSize) {
            console.warn("maxSymbolSize is greater than symbolContainerSize. This may cause overlapping between symbols.");
        }
        if (this.options.maxSymbolSize < this.options.minSymbolSize) {
            console.warn("maxSymbolSize is less than minSymbolSize. This may lead to unexpected results.")
        }
        // Check that a valid symbolScaling option is chosen
        if (this.symbolScalingOptions.indexOf(this.options.symbolScaling) < 0) {
            throw new Error(`Error: symbolScaling option "${this.options.symbolScaling}" not valid. Choose from "${this.symbolScalingOptions}."`)
        }
    },

    _initLayout: function () {
        L.DomEvent.disableClickPropagation(this._container);
        L.DomEvent.disableScrollPropagation(this._container);

        if (this.options.collapsed) {
            this._map.on('click', this.collapse, this);

            L.DomEvent.on(this._container, {
                mouseenter: this.expand,
                mouseleave: this.collapse
            }, this);
        }
        else {
            this.expand();
        }
    },

    _buildContainer: function () {
        this._container = L.DomUtil.create('div', 'leaflet-control-feature-legend leaflet-bar leaflet-control');

        this._contents = L.DomUtil.create('section', 'leaflet-control-feature-legend-contents', this._container)
        this._link = L.DomUtil.create('a', 'leaflet-control-feature-legend-toggle leaflet-control-layers', this._container);
        this._link.title = "Legend";
        this._link.href = "#";

        this._buildTitle();
        this._buildItems();
    },

    _buildTitle: function () {
        if (this.options.title) {
            let title = L.DomUtil.create('h3', 'leaflet-control-feature-legend-title', this._contents);
            title.innerText = this.options.title;
        }
    },

    _buildItems: function () {
        for (let item in this.items) {
            let itemLayer = this.items[item];

            if (!this._layerIsSupported(itemLayer)) {
                throw new Error(`Error: "${item}" is not a supported layer. Use only L.Marker, L.CircleMarker, or L.Circle.`);
            }

            let itemDiv = L.DomUtil.create('div', null, this._contents);
            let symbolContainer = L.DomUtil.create('i', null, itemDiv);
            let itemSymbol;

            if (itemLayer.options.icon) {
                if (!itemLayer.options.icon.options.iconSize) {
                    throw new Error(`Error: No icon size is defined for ${item}!`)
                }
                if (itemLayer.options.icon.options.shadowUrl && !itemLayer.options.icon.options.shadowSize) {
                    throw new Error(`Error: ${item} has a shadowUrl but no defined shadowSize!`)
                }
                itemSymbol = new ImageSymbol(itemLayer, symbolContainer, this)

            }
            else {
                itemSymbol = new MarkerSymbol(itemLayer, symbolContainer, this);
            }

            itemSymbol._container.style.width = itemSymbol._container.style.height = this.options.symbolContainerSize + "px";
            this._symbols.push(itemSymbol);

            let itemTitle = L.DomUtil.create('span', null, itemDiv);
            itemTitle.innerText = item;
        }
    },

    // Check if a given layer belongs to a class that can be added to the legend
    _layerIsSupported: function (layer) {
        if (layer instanceof L.CircleMarker || layer instanceof L.Circle || layer instanceof L.Marker) {
            return true;
        }
        return false;
    },

    onAdd: function (map) {
        this._map = map;
        this._initLayout();
        return this._container;
    },

    expand: function () {
        this._link.style.display = "none";
        L.DomUtil.addClass(this._container, 'leaflet-control-feature-legend-expanded');

        for (symbol of this._symbols) {
            symbol.recenter();
        }

        return this;
    },

    collapse: function () {
        this._link.style.display = "block";
        L.DomUtil.removeClass(this._container, 'leaflet-control-feature-legend-expanded');
        return this;
    },

    // Find the size of the largest dimension of all symbols, in pixels
    _getLargestSymbolSize: function () {
        let largestSize = 0;

        for (let symbol of this._symbols) {
            if (symbol.getLargestDimension() > largestSize) {

                largestSize = symbol.getLargestDimension();
            }
        }

        return largestSize;
    },

    // Find the size of the smallest dimension of all symbols, in pixels
    _getSmallestSymbolSize: function () {
        let smallestSize = Infinity;

        for (let symbol of this._symbols) {
            if (symbol.getSmallestDimension() < smallestSize) {
                smallestSize = symbol.getSmallestDimension();
            }
        }

        return smallestSize;
    },
})


L.control.featureLegend = function (items, options) {
    return new L.Control.FeatureLegend(items, options);
};


class MarkerSymbol {
    constructor(layer, container, legend) {
        this._layer = layer;
        this._container = container;
        this._legend = legend;
        this._markerOptions = this._layer.options;

        this._initialize();
    }

    _initialize = () => {
        this._canvas = this._buildMarker();

        this._strokeRatio = 0
        if (this._markerOptions.stroke && this._markerOptions.weight !== 0) {
            this._strokeRatio = this._markerOptions.weight / this.getLargestDimension();
        }

        this._draw();
    }

    _buildMarker = () => {
        let canvas = L.DomUtil.create('canvas', null, this._container);
        canvas.height = canvas.width = this._legend.options.symbolContainerSize;
        return canvas;
    }

    // Repurposed from Leaflet/Canvas.js to draw paths at a fixed location in the legend
    _draw = () => {
        const ctx = this._ctx = this._canvas.getContext('2d');

        let options = this._markerOptions;

        let r = options.radius;
        let x = this._legend.options.symbolContainerSize / 2;

        ctx.beginPath();
        ctx.arc(x, x, r, 0, Math.PI * 2, false);

        if (options.fill) {
            ctx.globalAlpha = options.fillOpacity;
            ctx.fillStyle = options.fillColor || options.color;
            ctx.fill(options.fillRule || 'evenodd');
        }

        if (options.stroke && options.weight !== 0) {
            if (ctx.setLineDash) {
                ctx.setLineDash(this._layer.options && this._layer.options._dashArray || []);
            }
            ctx.globalAlpha = options.opacity;
            ctx.lineWidth = options.weight;
            ctx.strokeStyle = options.color;
            ctx.lineCap = options.lineCap;
            ctx.lineJoin = options.lineJoin;
            ctx.stroke();
        }
    }

    _clear = () => {
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }

    // Calculate the total diameter of the drawn marker, in pixels
    _getOffsetSize = () => {
        let borderWidth = 0;

        if (this._markerOptions.stroke && this._markerOptions.weight !== 0) {
            borderWidth = this._markerOptions.weight;
        }

        let offsetSize = (this._markerOptions.radius + borderWidth) * 2;

        return offsetSize;
    }

    // Return the largest dimension of the marker, in pixels
    getLargestDimension = () => {
        return this._getOffsetSize();
    }

    // Return the smallest dimension of the marker, in pixels
    getSmallestDimension = () => {
        return this._getOffsetSize();
    }

    // Apply the appropriate scaling method to the symbol marker
    rescale = () => {
        switch (this._legend.options.symbolScaling) {
            case "clamped":
                this._clampedScale()
                break;
            case "maximum":
                this._maximumScale();
                break;
            case "proportional":
                this._proportionalScale(this._legend.scale, this._legend.offset);
                break;
            case "none":
                break;
        }

        this._clear();
        this._draw();
    }

    // TODO: It's silly to have a method that does nothing
    recenter = () => {

    }

    // Clamp the symbol marker size between the minimum and maximum dimensions
    _clampedScale = () => {
        let d = this.getLargestDimension();
        let rescaleDiameter = null;

        if (d > this._legend.options.maxSymbolSize) {
            rescaleDiameter = this._legend.options.maxSymbolSize;
        }
        else if (d < this._legend.options.minSymbolSize) {
            rescaleDiameter = this._legend.options.minSymbolSize;
        }
        else {
            rescaleDiameter = d;
        }

        this._scaleToDiameter(rescaleDiameter);
    }

    // Linearly scale the symbol marker using scale and offset values
    _proportionalScale = (scale, offset) => {
        let rescaleDiameter = this.getLargestDimension() * scale + offset;
        this._scaleToDiameter(rescaleDiameter);
    }

    // Scale the symbol marker to the max symbol size
    _maximumScale = () => {
        let rescaleDiameter = this._legend.options.maxSymbolSize;
        this._scaleToDiameter(rescaleDiameter);
    }

    // Proportionally scale the radius and stroke weight of the marker to a new diameter
    _scaleToDiameter = (diameter) => {
        this._markerOptions.weight = (diameter * this._strokeRatio);
        this._markerOptions.radius = (diameter - this._markerOptions.weight) / 2;
    }
}

class ImageSymbol {
    constructor(layer, container, legend) {
        this._layer = layer;
        this._container = container;
        this._legend = legend;
        this._icon = this._layer.getIcon();

        this._img = null;
        this._width = this._icon.options.iconSize[0];
        this._height = this._icon.options.iconSize[1];

        if (this._hasShadow()) {
            this._shadow = null;
            this._shadowWidth = this._icon.options.shadowSize[0];
            this._shadowHeight = this._icon.options.shadowSize[1];
        }

        this._loadImages();
    }

    // Async load main and shadow images, rescaling and centering after loading
    _loadImages = () => {
        // When an image finishes loading, check if both images are loaded
        let imageLoaded = () => {
            count--;
            if (count == 0) {
                allLoaded();
            }
        }

        // When both images are loaded, rescale and center the images
        let allLoaded = () => {
            this._legend._calculateScaling();
            this.rescale();
            this.recenter();
        }

        let count = 1;

        if (this._legend.options.drawShadows && this._hasShadow()) {
            count++;
            let shadow = L.DomUtil.create('img', null, this._container);
            shadow.onload = imageLoaded;
            shadow.src = this._icon instanceof L.Icon.Default ? L.Icon.Default.imagePath + "marker-shadow.png" : this._icon.options.shadowUrl;
            shadow.style.zIndex = 0;
            this._shadow = shadow;
        }

        let img = L.DomUtil.create('img', null, this._container);
        img.onload = imageLoaded;
        img.src = this._icon instanceof L.Icon.Default ? L.Icon.Default.imagePath + "marker-icon.png" : this._icon.options.iconUrl;
        img.style.zIndex = 1;
        this._img = img;
    }

    // Check if the Symbol has a defined shadow image
    _hasShadow = () => {
        return Boolean(this._icon.options.shadowUrl)
    }

    // Return the largest dimension of the marker, in pixels
    getLargestDimension = () => {
        return Math.max(this._width, this._height);
    }

    // Return the smallest dimension of the marker, in pixels
    getSmallestDimension = () => {
        return Math.min(this._width, this._height);
    }

    // Center the symbol image in its container
    recenter = () => {
        let containerCenterX = this._container.offsetWidth / 2;
        let containerCenterY = this._container.offsetHeight / 2;

        let imageCenterX;
        let imageCenterY;

        if (this._icon.options.iconAnchor) {
            let iconAnchorRatioX = this._icon.options.iconAnchor[0] / this._width;
            let iconAnchorRatioY = this._icon.options.iconAnchor[0] / this._width;

            imageCenterX = this._img.width * iconAnchorRatioX;
            imageCenterY = this._img.height * iconAnchorRatioY;
        }
        else {
            imageCenterX = parseInt(this._img.width) / 2;
            imageCenterY = parseInt(this._img.height) / 2;
        }

        let shiftX = containerCenterX - imageCenterX;
        let shiftY = containerCenterY - imageCenterY;

        this._img.style.left = shiftX.toString() + "px";
        this._img.style.top = shiftY.toString() + "px";


        if (this._shadow) {
            let shadowCenterX;
            let shadowCenterY;

            if (this._icon.options.shadowAnchor) {
                let shadowAnchorRatioX = this._icon.options.shadowAnchor[0] / this._icon.options.shadowSize[0];
                let shadowAnchorRatioY = this._icon.options.shadowAnchor[0] / this._icon.options.shadowSize[0];

                shadowCenterX = this._img.width * shadowAnchorRatioX;
                shadowCenterY = this._img.height * shadowAnchorRatioY;
            }
            else {
                shadowCenterX = parseInt(this._img.width) / 2;
                shadowCenterY = parseInt(this._img.height) / 2;
            }

            let shadowShiftX = containerCenterX - shadowCenterX;
            let shadowShiftY = containerCenterY - shadowCenterY;

            this._shadow.style.left = shadowShiftX.toString() + "px";
            this._shadow.style.top = shadowShiftY.toString() + "px";
        }
    }

    // Apply the appropriate scaling method to the symbol image
    rescale = () => {
        switch (this._legend.options.symbolScaling) {
            case "clamped":
                this._clampedScale();
                break;
            case "maximum":
                this._maximumScale();
                break;
            case "proportional":
                this._proportionalScale(this._legend.scale, this._legend.offset);
                break;
            case "none":
                break;
        }
    }

    // Clamp the symbol image size between the minimum and maximum dimensions
    _clampedScale = () => {
        for (let img of [this._img, this._shadow]) {
            if (img) {
                let maxDimension = Math.max(this._width, this._height);
                let minDimension = Math.min(this._width, this._height);

                if (maxDimension > this._legend.options.maxSymbolSize) {
                    if (img.width === maxDimension) {
                        img.width = this._legend.options.maxSymbolSize;
                    }
                    else {
                        img.height = this._legend.options.maxSymbolSize;
                    }
                }
                else if (minDimension < this._legend.options.minSymbolSize) {
                    if (img.width === maxDimension) {
                        img.width = this._legend.options.minSymbolSize;
                    }
                    else {
                        img.height = this._legend.options.minSymbolSize;
                    }
                }
            }
        }
    }

    // Linearly scale the symbol image using scale and offset values
    _proportionalScale = (scale, offset) => {
        if (this._img.width === this.getLargestDimension()) {
            this._img.width = this._width * scale + offset;
            if (this._shadow) {
                this._shadow.width = this._shadowWidth * scale + offset;
            }
        }
        else {
            this._img.height = this._height * scale + offset;
            if (this._shadow) {
                this._shadow.height = this._shadowHeight * scale + offset;
            }
        }
    }

    // Scale the image to the max symbol size
    _maximumScale = () => {
        if (this._img.width === this.getLargestDimension()) {
            this._img.width = this._legend.options.maxSymbolSize;
            if (this._shadow) {
                this._shadow.width = this._legend.options.maxSymbolSize;
            }
        }
        else {
            this._img.height = this._legend.options.maxSymbolSize;
            if (this._shadow) {
                this._shadow.height = this._legend.options.maxSymbolSize;
            }
        }
    }
}