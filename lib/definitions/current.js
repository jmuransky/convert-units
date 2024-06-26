var current;

current = {
  A: {
    name: {
      singular: 'Ampere'
    , plural: 'Amperes'
    }
  , to_anchor: 1
  }
, mA: {
    name: {
      singular: 'Milliampere'
      , plural: 'Milliamperes'
    }
    , to_anchor: .001
  }
 , µA: {
    name: {
      singular: 'Microampere'
      , plural: 'Microamperes'
    }
    , to_anchor: .000001
  },
  μA: {
    name: {
      singular: 'Microampere'
      , plural: 'Microamperes'
    }
    , to_anchor: .000001
  }
, kA: {
    name: {
      singular: 'Kiloampere'
    , plural: 'Kiloamperes'
    }
  , to_anchor: 1000
  }
};

module.exports = {
  metric: current
, _anchors: {
    metric: {
      unit: 'A'
    , ratio: 1
    }
  }
};
