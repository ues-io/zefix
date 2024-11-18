import { LoadBotApi } from "@uesio/bots"

type ZefixRequest = {
	name: string
}
	// These are the available fields from the full response body
type ZefixCompany = {
	name: string
	chid: string
	canton: string
	legalSeat: string
	status: string
	purpose: string
	capitalNominal: string
	cantonalExcerptWeb: string
	uid: string
}

type ZefixResponse = ZefixCompany[]

export default function company(bot: LoadBotApi) {

	const { conditions } = bot.loadRequest
	const baseUrl = bot.getIntegration().getBaseURL()

	// If no conditions were provided, return no records.
	if (!conditions || conditions.length === 0) {
		return
	}

	let searchCondition = ""
	let idCondition = ""

	// Figure out which type of condition was sent in.
	conditions.forEach((condition) => {
		if (condition.type === "SEARCH") {
			searchCondition = condition.value as string
		} else if (condition.field === "uesio/core.id") {
			idCondition = condition.value as string
		}
	})

	let url = ""
	let method = ""
	let body = undefined

	if (searchCondition) {
		// If we were sent a search condition, use the search API
		url = `${baseUrl}/api/v1/company/search`
		method = "POST"
		body = {
			name: searchCondition,
		}
	} else if (idCondition) {
		// If we were sent an id condition use the chid API
		url = `${baseUrl}/api/v1/company/chid/${idCondition}`
		method = "GET"
	} else {
		return
	}

	const response = bot.http.request<ZefixRequest,ZefixResponse>({
		headers: {
			"Content-Type": "application/json",
		},
		method,
		url,
		body,
	})

	// Here we match the retrieved data records to the collection data
	response.body.forEach((record) => {
		bot.addRecord({
			["name"]: record.name,
			["canton"]: record.canton,
			["legalseat"]: record.legalSeat,
			["status"]: record.status,
			["purpose"]: record.purpose,
			["capitalnominal"]: record.capitalNominal,
			["cantonalexcerptweb"]: record.cantonalExcerptWeb,
			["uid"]: record.uid, 
			["uesio/core.id"]: record.chid,
		})
	})

}