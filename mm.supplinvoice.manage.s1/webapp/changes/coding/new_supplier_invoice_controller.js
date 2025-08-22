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
        return ControllerExtension.extend("customer.mm.supplinvoice.manage.s1.new_supplier_invoice_controller", {

            // Determinar el código de detracción
            _setDetractionCode: function () {

                if (!this._bPurchaseOrderUpdated) return;
                let tbTax = this.getView().byId("idS2P.MM.MSI.TableWithholdingTax")
                if (tbTax.getItems().length <= 0) return;

                tbTax.getItems().forEach(function (oItem) {

                    let oContext = oItem.getBindingContext();
                    let oData = oContext.getObject();

                    if (oData.WithholdingTaxType === "D1" && !oData.WitholdingTaxCode) {

                        let sfTaxCode = oItem.getCells().find(function (cell) {
                            return cell.getId().includes("WithholdingTaxCode");
                        });

                        // oData para determinar código de detracción
                        let oModel = this.getView().getModel("customer.ZFacturaProveedorModel");
                        oModel.read("/DetractionCodeDeterminationSet", {
                            filters: [
                                new sap.ui.model.Filter("PurchaseOrder", "EQ", this._purchaseOrder),
                            ],
                            success: function (oData) {
                                if (oData.results && oData.results.length > 0) {
                                    let detCode = oData.results[0].DetractionCode;
                                    sfTaxCode.getModel().setProperty("WithholdingTaxCode", detCode);
                                    sfTaxCode.setValue(detCode);
                                    // Simular una modificación para forzar la validación del código de detracción
                                    let sfParty = this.getView().byId("idS2P.MM.MSI.CEInputInvoicingParty");
                                    sfParty.fireChange({ value: "9999999999" });
                                }
                            }.bind(this),
                            error: function (oError) {
                                console.error(oError);
                            }
                        });
                    }
                }.bind(this));

                this._bPurchaseOrderUpdated = false;
                this._purchaseOrder = "";

            },

            // this section allows to extend lifecycle hooks or override public methods of the base controller
            override: {

                onAfterRendering: function () {

                    let btnCheck = this.getView().byId("idS2P.MM.MSI.ButtonCheck-BDI-content");
                    console.log(btnCheck);

                    let sfReference = this.getView().byId("idS2P.MM.MSI.CEInputReference");
                    sfReference.attachChange(function (event) {
                        // Obtener datos a enviar
                        let oContext = sfReference.getBindingContext();
                        if (oContext) {
                            if (sfReference.getValue()) {
                                let oData = oContext.getObject();

                                let oModel = this.getView().getModel("customer.ZFacturaProveedorModel");
                                oModel.read("/ReferenceValidationSet", {
                                    filters: [
                                        new sap.ui.model.Filter("Reference", "EQ", oData.Reference),
                                        new sap.ui.model.Filter("CompanyCode", "EQ", oData.CompanyCode),
                                        new sap.ui.model.Filter("DocumentDate", "EQ", oData.DocumentDate),
                                        new sap.ui.model.Filter("AccountingDocumentType", "EQ", oData.AccountingDocumentType),
                                        new sap.ui.model.Filter("InvoicingParty", "EQ", oData.InvoicingParty),
                                    ],
                                    success: function (res) {
                                        if (res.results && res.results.length > 0) {
                                            sfReference.setValue(res.results[0].Reference);
                                        }
                                        console.log(res);
                                    }.bind(this),
                                    error: function (oError) {
                                        console.log(oError);
                                        // let oMessageManager = sap.ui.getCore().getMessageManager();
                                        // oMessageManager.removeAllMessages();

                                        // var oResponse = JSON.parse(oError.responseText);
                                        // var aMessages = oResponse.error.innererror.errordetails;

                                        // console.log(sfReference.getModel("Headers"));
                                        // console.log(sfReference.getModel());
                                        // console.log(sfReference.getBinding("value").getPath());
                                        // aMessages.forEach(function (msg) {
                                        //     oMessageManager.addMessages(
                                        //         new sap.ui.core.message.Message({
                                        //             message: msg.message,
                                        //             type: msg.severity === "error" ? sap.ui.core.MessageType.Error : sap.ui.core.MessageType.Warning,
                                        //             target: "/" + sfReference.getBinding("value").getPath(),
                                        //             processor: sfReference.getModel("Headers")
                                        //         })
                                        //     );
                                        // });
                                    }
                                });
                            }
                        }

                    }.bind(this));

                    let tbTax = this.getView().byId("idS2P.MM.MSI.TableWithholdingTax")
                    let miPurchaseOrder = this.getView().byId("idS2P.MM.MSI.MultiInputQuickPurchaseOrderEntry");

                    // Evento: Modificaciones en la tabla de indicadores de retención
                    tbTax.attachUpdateFinished(function () {
                        let taxTableBinding = tbTax.getBinding("items");
                        taxTableBinding.attachChange(function (oEvent) {
                            if (this._bPurchaseOrderUpdated === true) {
                                this._setDetractionCode();
                            }
                        }.bind(this));
                    }.bind(this));

                    miPurchaseOrder.attachTokenUpdate(function (event) {

                        let po = event.getSource().getTokens()[0];

                        if (!po) {
                            this._bPurchaseOrderUpdated = false;
                            this._purchaseOrder = ""
                        } else {
                            this._bPurchaseOrderUpdated = true;
                            this._purchaseOrder = po.getKey().substring(0, 10);
                            this._setDetractionCode();
                        }

                    }.bind(this));

                }
            }
        });
    }
);
