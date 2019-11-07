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
	pluginOptions: {
		i18n: {
			locale: 'en',
			fallbackLocale: 'en',
			localeDir: 'locales',
			enableInSFC: false
		},

		electronBuilder: {
			builderOptions: {
				win: {
					icon: './logo.ico'
				},
				mac: {
					icon: './logo.icns'
				},
				linux: {
					icon: './logo.png'
				}
			}
		}
	}
}
