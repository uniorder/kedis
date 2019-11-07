var webpack = require('webpack');
module.exports = {
	configureWebpack: {
		plugins: [
			new webpack.ProvidePlugin({
				$: 'jquery',
				jQuery: 'jquery'
			})
		]
	},
	electronBuilder: {
		builderOptions: {
			win: {
				icon: './icon.ico'
			}
		}
	},
	pluginOptions: {
		i18n: {
			locale: 'en',
			fallbackLocale: 'en',
			localeDir: 'locales',
			enableInSFC: false
		}
	}
}
