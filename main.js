const fs = require('fs')
const axios = require('axios')
const jsdom = require('jsdom')
const stringify = require('csv-stringify')
const { fstat } = require('fs')
const url = "https://newworld.wiki.fextralife.com"
async function get() {
	let response = await axios.get(url + '/Perks')
	const { document } = new jsdom.JSDOM(response.data).window
	let table = document.querySelector('table')
	let trs = table.querySelectorAll('tr')
	let rows = []
	let extraRows = []
	for (let tr of trs) {
		let row = []
		tds = tr.querySelectorAll('td')
		if (tds.length != 0) {
			for (let [i, td] of tds.entries()) {
				// 0 = img and/or name, 1 = cat, 2  = description
				if (i == 0) {
					//image cell and name cell
					let img = td.querySelector('img')
					if (img) {
						row.push(url + img.getAttribute('src'))
					} else {
						row.push('')
					}
					row.push(td.textContent)
				} else if (i == 1) {
					//cat cell
					let cats = ['Main Hand', 'Two Hand', 'Armor', 'Amulet', 'Rings', 'Token', 'Fishing Pole', 'War Hammers', 'Great Axe', 'Bow', 'Life Staff', 'Life Staves', 'Fire Staff', 'Rapier', 'Bag', 'Earrings', 'Bows', 'Ice Gauntlets', 'Logging Axe', 'Meele', 'Musket', 'Pick Axe', 'Ranged', 'Shield', 'Sickle', 'Skinning Knife', 'Spear', 'Tools']
					foundCats = []
					for (cat of cats) {
						if (td.textContent.match(cat)) {
							//normalization
							//change Amulets to singular 
							if (cat == "Amulet") {
								if (td.textContent.match('Amulets')) {
									cat = 'Amulet'
								}
							}
							//change Live Staves to singular
							if (td.textContent.match('Life Staves')) {
								cat = 'Life Staff'
							}
							// push
							foundCats.push(cat)
						}
					}
					if (foundCats) {
						//push only one cat per cell
						row.push(foundCats[0])
						foundCats.shift()
					} else {
						row.push('')
					}
				} else if (i == 2) {
					//description cell
					row.push(td.textContent)
				}
			}
			//mark for more pushes if still foundCats 
			if (foundCats) {
				for (cat of foundCats) {
					let addRow = [...row]
					addRow[2] = cat
					extraRows.push(addRow)
				}
				foundCats = 0
			}
			rows.push(row)
		}
	}
	stringify([...rows, ...extraRows],
		function foo(err, output) {
			fs.writeFile('./data.csv', output, { encoding: "utf8" }, function () { })
			if (err) {
				console.log(err)
			}
		})
}
get()