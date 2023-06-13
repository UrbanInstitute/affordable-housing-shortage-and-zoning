/**
	Function to log custom events with google gtag analytics. In order for this to work properly
	you're <head> element should include the following:

	<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXX"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag('js', new Date());
		gtag('config', 'G-XXXXXX');
	</script>

	where "G-XXXXXX" is replaced with your unique google tracking id


	inputs:
		eventType - e.g. 'button-click', 'in-view'
		data - object with at least a 'firing-module-name' property that defines the element that was acted on
			e.g. {
				'firing-module-name': 'my-custom-dropdown',
				'value': 'current-option'
			}
 */

export function gtagEvent(eventType, data = {}) {
	gtag('event', eventType, data);
}
