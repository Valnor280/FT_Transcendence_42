<template>
<div class="test">
	<section class="text-center about">
		<h1>About US</h1>
		<div class="container">
			<div class="col about-item wow lightSpeedIn" data-wow-offset="200">
				<span class="fa fa-info">
					<svg xmlns="http://www.w3.org/2000/svg" width="50%" height="50%" fill="currentColor" class="bi bi-info" viewBox="0 0 16 16">
						<path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
					</svg>
				</span>
				<p class="lead">We are a five person group trying to complete the final project of the 42School in Paris, France</p>
			</div>
		</div>
	</section>
</div>
</template>

<script lang="ts">
import $axios from '../plugin/axios'
export default {
	mounted(){
		$axios.put('/api/account/achievement/nine')
	},
}
</script>
<style scoped>


.about{
	cursor: pointer;
	color: #811010;
	padding-top: 20px;
	padding-bottom: 30px;
}
.about h1 {
	padding: 10px 0;
	margin-bottom: 20px;
}
.about h2 {
	opacity: .8;
}
.about span {
	display: block;
	width: 100px;
	height: 100px;
	line-height: 100px;
	margin:auto;
	border-radius:50%;  
	font-size: 40px;
	color: #a31e1e;
	opacity: 0.7;
	background-color: #4C0822;
	border: 2px solid #4C0822;

	webkit-transition:all .5s ease;
 	moz-transition:all .5s ease;
 	os-transition:all .5s ease;
 	transition:all .5s ease;

}
.about-item:hover span{
	opacity: 1;	
	border: 2px solid #CC0039;
	font-size: 42px;
	-webkit-transform: scale(1.1,1.1) rotate(360deg) ;
	-moz-transform: scale(1.1,1.1) rotate(360deg) ;
	-o-transform: scale(1.1,1.1) rotate(360deg) ;
	transform: scale(1.1,1.1) rotate(360deg) ;
}
.about-item:hover h2{
	opacity: 1;
	-webkit-transform: scale(1.1,1.1)  ;
	-moz-transform: scale(1.1,1.1)  ;
	-o-transform: scale(1.1,1.1)  ;
	transform: scale(1.1,1.1) ;
}
.about .lead{
	color: #CC0039;
	font-size: 14px;
	font-weight: bold;
}
</style>