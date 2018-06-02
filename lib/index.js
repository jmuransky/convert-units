var convert
  , keys = require('lodash.keys')
  , each = require('lodash.foreach')
  , measures = {
      length: require('./definitions/length')
    , area: require('./definitions/area')
    , mass: require('./definitions/mass')
    , volume: require('./definitions/volume')
    , each: require('./definitions/each')
    , temperature: require('./definitions/temperature')
    , time: require('./definitions/time')
    , digital: require('./definitions/digital')
    , partsPer: require('./definitions/partsPer')
    , speed: require('./definitions/speed')
    , pace: require('./definitions/pace')
    , pressure: require('./definitions/pressure')
    , current: require('./definitions/current')
    , voltage: require('./definitions/voltage')
    , power: require('./definitions/power')
    , reactivePower: require('./definitions/reactivePower')
    , apparentPower: require('./definitions/apparentPower')
    , energy: require('./definitions/energy')
    , reactiveEnergy: require('./definitions/reactiveEnergy')
    , volumeFlowRate: require('./definitions/volumeFlowRate')
    , illuminance: require('./definitions/illuminance')
    , frequency: require('./definitions/frequency')
    , angle : require('./definitions/angle')
    , charge : require('./definitions/charge')
    , force : require('./definitions/force')
    , acceleration : require('./definitions/acceleration')
    , torque : require('./definitions/torque')
    , resistance : require('./definitions/resistance')
    }
  , Converter;

Converter = function (numerator, denominator) {
  if(denominator)
    this.val = numerator / denominator;
  else
    this.val = numerator;
};

/**
* Lets the converter know the source unit abbreviation
*/
Converter.prototype.from = function (from) {
  if(this.destination)
    throw new Error('.from must be called before .to');

  if (!this.isSupportedUnit(from)) {
    this.throwUnsupportedUnitError(from);
  }

  this.fromUnit = from;

  return this;
};

/**
* Converts the unit and returns the value
*/
Converter.prototype.to = function (to) {
  if(!this.fromUnit)
    throw new Error('.to must be called after .from');

  if (!this.isSupportedUnit(to)) {
    this.throwUnsupportedUnitError(to);
  }

  var units = this.getMatchingUnits(this.fromUnit, to);
  this.origin = units[this.fromUnit];
  this.destination = units[to];

  var result
    , transform;

  // Don't change the value if origin and destination are the same
  if (this.origin.abbr === this.destination.abbr) {
    return this.val;
  }

  // You can't go from liquid to mass, for example
  if(this.destination.measure != this.origin.measure) {
    throw new Error('Cannot convert incompatible measures of '
      + this.destination.measure + ' and ' + this.origin.measure);
  }

  /**
  * Convert from the source value to its anchor inside the system
  */
  result = this.val * this.origin.unit.to_anchor;

  /**
  * For some changes it's a simple shift (C to K)
  * So we'll add it when convering into the unit (later)
  * and subtract it when converting from the unit
  */
  if (this.origin.unit.anchor_shift) {
    result -= this.origin.unit.anchor_shift
  }

  /**
  * Convert from one system to another through the anchor ratio. Some conversions
  * aren't ratio based or require more than a simple shift. We can provide a custom
  * transform here to provide the direct result
  */
  if(this.origin.system != this.destination.system) {
    transform = measures[this.origin.measure]._anchors[this.origin.system].transform;
    if (typeof transform === 'function') {
      result = transform(result)
    }
    else {
      result *= measures[this.origin.measure]._anchors[this.origin.system].ratio;
    }
  }

  /**
  * This shift has to be done after the system conversion business
  */
  if (this.destination.unit.anchor_shift) {
    result += this.destination.unit.anchor_shift;
  }

  /**
  * Convert to another unit inside the destination system
  */
  return result / this.destination.unit.to_anchor;
};

/**
* Converts the unit to the best available unit.
*/
Converter.prototype.toBest = function(options) {
  if(!this.fromUnit)
    throw new Error('.toBest must be called after .from');

  this.origin = this.getUnit(this.fromUnit)

  var options = Object.assign({
    exclude: [],
    cutOffNumber: 1,
  }, options)

  var best;
  /**
    Looks through every possibility for the 'best' available unit.
    i.e. Where the value has the fewest numbers before the decimal point,
    but is still higher than 1.
  */
  each(this.possibilities(), function(possibility) {
    var unit = this.describe(possibility);
    var isIncluded = options.exclude.indexOf(possibility) === -1;

    if (isIncluded && unit.system === this.origin.system) {
      var result = this.to(possibility);
      if (!best || (result >= options.cutOffNumber && result < best.val)) {
        best = {
          val: result,
          unit: possibility,
          singular: unit.singular,
          plural: unit.plural
        };
      }
    }
  }.bind(this));

  return best;
}

Converter.prototype.getMatchingUnits = function (abbr1, abbr2) {
  var found = {};
  
  each(measures, function (systems, measure) {
    var abbr1Found;
    var abbr2Found;

    each(systems, function (units, system) {
      if(system == '_anchors')
        return false; 

      each(units, function (unit, testAbbr) {
        if(testAbbr == abbr1 || testAbbr == abbr2) {
          found[testAbbr] = {
            abbr: testAbbr
          , measure: measure
          , system: system
          , unit: unit
          };

          if (testAbbr == abbr1) {
            abbr1Found = true;
          } else if (testAbbr == abbr2) {
            abbr2Found = true;
          }
        }
        return !(abbr1Found && abbr2Found);
      });

      return !(abbr1Found && abbr2Found);
    });

    return !(abbr1Found && abbr2Found);
  });

  if(!found[abbr1]) {
    this.throwUnsupportedUnitError(abbr1);
  }
  if(!found[abbr2]) {
    this.throwUnsupportedUnitError(abbr2);
  }

  return found;
}

/**
* Finds the unit
*/
Converter.prototype.getUnit = function (abbr, targetMeasure) {
  var found;
  var possibleMeasures = measures;

  if (targetMeasure) {
    possibleMeasures = {}
    possibleMeasures[targetMeasure] = measures[targetMeasure]
  }

  each(possibleMeasures, function (systems, measure) {
    each(systems, function (units, system) {
      if(system == '_anchors')
        return false;

      each(units, function (unit, testAbbr) {
        if(testAbbr == abbr) {
          found = {
            abbr: abbr
          , measure: measure
          , system: system
          , unit: unit
          };
          return false;
        }
      });

      if(found)
        return false;
    });

    if(found)
      return false;
  });

  if(!found) {
    this.throwUnsupportedUnitError(from);
  }

  return found;
};

var describe = function(resp) {
  return {
    abbr: resp.abbr
  , measure: resp.measure
  , system: resp.system
  , singular: resp.unit.name.singular
  , plural: resp.unit.name.plural
  };
}

/**
* An alias for getUnit
*/
Converter.prototype.describe = function (abbr) {
  var resp = Converter.prototype.getUnit(abbr);
  return describe(resp);
};

/**
* Detailed list of all supported units
*/
Converter.prototype.list = function (measure) {
  var list = [];

  each(measures, function (systems, testMeasure) {
    if(measure && measure !== testMeasure)
      return;

    each(systems, function (units, system) {
      if(system == '_anchors')
        return false;

      each(units, function (unit, abbr) {
        list = list.concat(describe({
          abbr: abbr,
          measure: testMeasure
        , system: system
        , unit: unit
        }));
      });
    });
  });

  return list;
};

Converter.prototype.isSupportedUnit = function (abbr) {
  const supportedUnits = this.list();
  return supportedUnits.some(function(unit) {
    return unit.abbr == abbr;
  })
}

Converter.prototype.throwUnsupportedUnitError = function (what) {
  var validUnits = [];

  each(measures, function (systems, measure) {
    each(systems, function (units, system) {
      if(system == '_anchors')
        return false;

      validUnits = validUnits.concat(keys(units));
    });
  });

  throw new Error('Unsupported unit ' + what + ', use one of: ' + validUnits.join(', '));
}

/**
* Returns the abbreviated measures that the value can be
* converted to.
*/
Converter.prototype.possibilities = function (measure) {
  var possibilities = [];
  if(!this.origin && !measure) {
	  each(keys(measures), function (measure){
		  each(measures[measure], function (units, system) {
		    if(system == '_anchors')
		      return false;

		    possibilities = possibilities.concat(keys(units));
		  });
	  });
  } else {
	  measure = measure || this.origin.measure;
	  each(measures[measure], function (units, system) {
	    if(system == '_anchors')
	      return false;

	    possibilities = possibilities.concat(keys(units));
	  });
  }

  return possibilities;
};

/**
* Returns the abbreviated measures that the value can be
* converted to.
*/
Converter.prototype.measures = function () {
  return keys(measures);
};

convert = function (value) {
  return new Converter(value);
};

module.exports = convert;
