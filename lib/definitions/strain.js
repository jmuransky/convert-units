var metric = {
  'ε' : {
    name: {
      singular: 'Strain'
      , plural: 'Strains'
    }
    , to_anchor: 1
  },
  'mε' : {
    name: {
      singular: 'Millistrain'
      , plural: 'Millistrains'
    }
    , to_anchor: 1e-3
  },
  'µε' : {
    name: {
      singular: 'Microstrain'
      , plural: 'Microstrains'
    }
    , to_anchor: 1e-6
  }
}

module.exports = {
  metric: metric
  , imperial: {}
  , _anchors: {
    metric: {
      unit: 'ε'
      , ratio: 1
    }
  }
};
