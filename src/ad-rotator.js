/**
 * DefaultConfig
 * @param shape
 * @returns {{padding: number, margin: number, shape: string, sticky: boolean, width: number, height: number}}
 */
function getDefaultConfig(shape = 'square') {
  let config = {
    shape: 'square',
    height: 400,
    width: 400,
    padding: 0,
    margin: 0,
    sticky: false
  };
  if (shape === 'rectangle-horizontal') {
    config.height = 200;
    config.width = 600;
    return config;
  }
  if (shape === 'rectangle-vertical') {
    config.height = 600;
    config.width = 200;
    return config;
  }

  return  config;
}

export default function (units = {}, options = {}) {
  const {sticky, shape, height, width, padding, margin} = Object.assign({}, getDefaultConfig(), options);


  return {
    test() {
      console.log('---->>>>', sticky, shape, height, width, padding, margin);
    }
  }
}

