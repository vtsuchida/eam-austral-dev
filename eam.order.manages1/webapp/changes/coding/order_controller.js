sap.ui.define(
    [
        'sap/ui/core/mvc/ControllerExtension'
        // ,'sap/ui/core/mvc/OverrideExecution'
    ],
    function (
        ControllerExtension
        // ,OverrideExecution
    ) {
        'use strict';
        return ControllerExtension.extend("customer.eam.order.manages1.order_controller", {
            // metadata: {
            // 	// extension can declare the public methods
            // 	// in general methods that start with "_" are private
            // 	methods: {
            // 		publicMethod: {
            // 			public: true /*default*/ ,
            // 			final: false /*default*/ ,
            // 			overrideExecution: OverrideExecution.Instead /*default*/
            // 		},
            // 		finalPublicMethod: {
            // 			final: true
            // 		},
            // 		onMyHook: {
            // 			public: true /*default*/ ,
            // 			final: false /*default*/ ,
            // 			overrideExecution: OverrideExecution.After
            // 		},
            // 		couldBePrivate: {
            // 			public: false
            // 		}
            // 	}
            // },
            // // adding a private method, only accessible from this controller extension
            // _privateMethod: function() {},
            // // adding a public method, might be called from or overridden by other controller extensions as well
            // publicMethod: function() {},
            // // adding final public method, might be called from, but not overridden by other controller extensions as well
            // finalPublicMethod: function() {},
            // // adding a hook method, might be called by or overridden from other controller extensions
            // // override these method does not replace the implementation, but executes after the original method
            // onMyHook: function() {},
            // // method public per default, but made private via metadata
            // couldBePrivate: function() {},

            _setFieldVisibility(fieldName, orderTypeValue) {
                // Obtener GroupElement
                let groupElementName = "";
                if (this._entitySet === "C_ObjPgMaintOrder") {
                    groupElementName = "i2d.eam.order.manages1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_ObjPgMaintOrder--customer.eam.order.manages1.GE_" + fieldName + "_ORI"
                } else if (this._entitySet === "C_ObjPgMaintOrderOperation") {
                    groupElementName = "i2d.eam.order.manages1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_ObjPgMaintOrderOperation--customer.eam.order.manages1.GE_" + fieldName + "_MOP"
                } else {
                    return;
                }
                let groupElement = sap.ui.getCore().byId(groupElementName);
                if (groupElement && typeof orderTypeValue !== "undefined") {
                    let visible = typeof this._auartFields[orderTypeValue] != "undefined" && this._auartFields[orderTypeValue].includes(fieldName.toUpperCase());
                    // Ocultar campo si tipo de aviso no se encuentra registrado en las constantes
                    groupElement.setVisible(visible);
                }
            },

            _validateCustomFields() {

                // Obtener SmartField Order Type
                let sf_OrderType = sap.ui.getCore().byId("i2d.eam.order.manages1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_ObjPgMaintOrder--header::headerEditable::HRF_Order_HeaderInfo1::MaintenanceOrderType::Field");

                // Escuchar evento attachModelContextChange
                this.getView().attachModelContextChange(function () {
                    let orderTypeValue = sf_OrderType.getBindingContext()?.getProperty(sf_OrderType.getBindingPath("value"));

                    if (this._entitySet === "C_ObjPgMaintOrder") {
                        this._setFieldVisibility("ZZ1_PuertoAtencion", orderTypeValue);
                        this._setFieldVisibility("ZZ1_MotivoPostergacion", orderTypeValue);
                        this._setFieldVisibility("ZZ1_EstadoEmbarcacion", orderTypeValue);
                    } else if (this._entitySet === "C_ObjPgMaintOrderOperation") {
                        console.log("HOLAAAAAAAAAAAAAAAAAAAAAA")
                        this._setFieldVisibility("ZZ1_MotivoEliminacion", orderTypeValue);
                        this._setFieldVisibility("ZZ1_ProgramaVeda", orderTypeValue);
                        this._setFieldVisibility("ZZ1_TipoCompra", orderTypeValue);
                        this._setFieldVisibility("ZZ1_PorcAvanceReal", orderTypeValue);
                        this._setFieldVisibility("ZZ1_Prioridad", orderTypeValue);
                    }
                }.bind(this));

                // Lanzar el evento attachModelContextChange luego de registrar el listener (función attach)
                this.getView().fireModelContextChange();

            },

            // this section allows to extend lifecycle hooks or override public methods of the base controller
            override: {
                // 	/**
                // 	 * Called when a controller is instantiated and its View controls (if available) are already created.
                // 	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
                // 	 * @memberOf customer.eam.order.manages1.order_controller
                // 	 */
                // 	onInit: function() {
                // 	},
                /**
                 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
                 * (NOT before the first rendering! onInit() is used for that one!).
                 * @memberOf customer.eam.order.manages1.order_controller
                 */
                onBeforeRendering: function () {

                    // Leer constantes
                    this._auartFields = {};
                    this._componentPrefix = sap.ui.core.Component.getOwnerIdFor(this.getView());
                    let prefixParts = this._componentPrefix.split("::");
                    this._entitySet = prefixParts[prefixParts.length - 1];

                    let program = "";

                    if (this._entitySet === "C_ObjPgMaintOrder") {
                        program = "ORD_HEADER";
                    } else if (this._entitySet === "C_ObjPgMaintOrderOperation") {
                        program = "ORD_OPER";
                    } else {
                        return;
                    }

                    let oModel = this.getView().getModel("customer.ZConstModel");
                    if (typeof oModel !== "undefined")
                        oModel.read("/zosdd_constantes", {
                            filters: [
                                new sap.ui.model.Filter("Modulo", "EQ", "PM"),
                                new sap.ui.model.Filter("Aplicacion", "EQ", "CUSTOM_FIELDS"),
                                new sap.ui.model.Filter("Programa", "EQ", program),
                                new sap.ui.model.Filter("Campo", "EQ", "AUART")
                            ],
                            success: function (oData) {
                                console.log(oData)
                                oData.results.forEach(obj => {
                                    const key = obj?.Valor1;
                                    const value = obj?.Valor2;
                                    if (key && value) {
                                        if (!this._auartFields[key]) {
                                            this._auartFields[key] = [];
                                        }
                                        this._auartFields[key].push(value);
                                    }
                                });
                                console.log(this._auartFields);
                                // Si la lectura de constantes no tuvo errores, se ejecuta la lógica para la visualización de los campos personalizados
                                this._validateCustomFields();
                            }.bind(this),
                            error: function (oError) {
                                // Si hay error en la lectura de constantes, la validación ocultará todos los campos
                                this._validateCustomFields();
                                console.error(oError);
                            }
                        });

                },
                // 	/**
                // 	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
                // 	 * This hook is the same one that SAPUI5 controls get after being rendered.
                // 	 * @memberOf customer.eam.order.manages1.order_controller
                // 	 */
                // 	onAfterRendering: function() {
                // 	},
                // 	/**
                // 	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
                // 	 * @memberOf customer.eam.order.manages1.order_controller
                // 	 */
                // 	onExit: function() {
                // 	},
                // 	// override public method of the base controller
                // 	basePublicMethod: function() {
                // 	}
            }
        });
    }
);
